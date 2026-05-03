/**
 * BookBuzz Payment Service
 * Handles Razorpay payment integration
 * 
 * Usage:
 * - Loads Razorpay checkout.js dynamically
 * * Creates payment orders via backend API
 * - Handles payment success/failure callbacks
 */

class PaymentService {
    constructor() {
        this.apiUrl = this.getApiUrl();
        this.razorpayKeyId = null; // Will be fetched from backend
        this.razorpayLoaded = false;
    }

    getApiUrl() {
        const baseUrl = window.location.origin;
        return {
            createOrder: `${baseUrl}/BookBuzzz/api/create-order.php`,
            verifyPayment: `${baseUrl}/BookBuzzz/api/verify-payment.php`
        };
    }

    /**
     * Load Razorpay checkout script dynamically
     */
    loadRazorpayScript() {
        return new Promise((resolve, reject) => {
            if (this.razorpayLoaded) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => {
                this.razorpayLoaded = true;
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load Razorpay script'));
            };
            document.body.appendChild(script);
        });
    }

    /**
     * Create a payment order
     * @param {Object} book - Book details
     * @param {Object} buyer - Buyer details
     * @returns {Promise<Object>} Order details
     */
    async createOrder(book, buyer) {
        try {
            const amountInPaise = Math.round(book.price * 100); // Convert to paise
            
            const response = await fetch(this.apiUrl.createOrder, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amountInPaise,
                    currency: 'INR',
                    receipt: `BOOK_${book.id}_${Date.now()}`,
                    notes: {
                        book_id: book.id,
                        book_title: book.title,
                        buyer_id: buyer.id || 'guest',
                        buyer_email: buyer.email
                    }
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.razorpayKeyId = data.key_id;
                return {
                    success: true,
                    orderId: data.order_id,
                    amount: data.amount,
                    currency: data.currency,
                    keyId: data.key_id
                };
            } else {
                throw new Error(data.message || 'Failed to create order');
            }

        } catch (error) {
            console.error('Order creation failed:', error);
            return {
                success: false,
                message: error.message || 'Failed to create payment order'
            };
        }
    }

    /**
     * Initialize and open Razorpay checkout
     * @param {Object} order - Order details from createOrder
     * @param {Object} book - Book details
     * @param {Object} buyer - Buyer details
     * @returns {Promise<Object>} Payment result
     */
    async initiatePayment(order, book, buyer) {
        try {
            await this.loadRazorpayScript();

            return new Promise((resolve, reject) => {
                const options = {
                    key: order.keyId,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'BookBuzz',
                    description: `Purchase: ${book.title}`,
                    image: `${window.location.origin}/images/logo.png`,
                    order_id: order.orderId,
                    handler: async (response) => {
                        // Payment successful, verify signature
                        const verifyResult = await this.verifyPayment(
                            response.razorpay_order_id,
                            response.razorpay_payment_id,
                            response.razorpay_signature
                        );

                        if (verifyResult.success) {
                            resolve({
                                success: true,
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                amount: order.amount / 100,
                                book: book,
                                message: 'Payment successful!'
                            });
                        } else {
                            reject(new Error('Payment verification failed'));
                        }
                    },
                    prefill: {
                        name: buyer.name || '',
                        email: buyer.email || '',
                        contact: buyer.mobile || ''
                    },
                    notes: {
                        book_id: book.id,
                        book_title: book.title
                    },
                    theme: {
                        color: '#e86c1f'
                    },
                    modal: {
                        ondismiss: () => {
                            reject(new Error('Payment cancelled by user'));
                        }
                    }
                };

                const razorpay = new Razorpay(options);
                
                razorpay.on('payment.failed', (response) => {
                    reject(new Error(response.error.description || 'Payment failed'));
                });

                razorpay.open();
            });

        } catch (error) {
            console.error('Payment initiation failed:', error);
            return {
                success: false,
                message: error.message || 'Failed to initiate payment'
            };
        }
    }

    /**
     * Verify payment signature on backend
     * @param {string} orderId - Razorpay order ID
     * @param {string} paymentId - Razorpay payment ID
     * @param {string} signature - Razorpay signature
     */
    async verifyPayment(orderId, paymentId, signature) {
        try {
            const response = await fetch(this.apiUrl.verifyPayment, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    razorpay_order_id: orderId,
                    razorpay_payment_id: paymentId,
                    razorpay_signature: signature
                })
            });

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Payment verification failed:', error);
            return {
                success: false,
                message: 'Payment verification failed'
            };
        }
    }

    /**
     * Complete purchase flow
     * @param {Object} book - Book to purchase
     * @param {Object} buyer - Buyer details
     */
    async purchaseBook(book, buyer) {
        try {
            // Check if buyer is logged in
            if (!buyer.email) {
                throw new Error('Please login to purchase books');
            }

            // Show loading
            showToast('Initializing payment...', 'default');

            // Step 1: Create order
            const order = await this.createOrder(book, buyer);
            
            if (!order.success) {
                throw new Error(order.message);
            }

            // Step 2: Initiate payment
            const payment = await this.initiatePayment(order, book, buyer);

            if (payment.success) {
                // Add to purchases
                this.addToPurchases(book, buyer, payment);

                // Send confirmation email
                if (window.emailService) {
                    await window.emailService.sendPurchaseConfirmation(
                        buyer.email,
                        buyer.name,
                        book,
                        book.seller || 'Seller'
                    );
                }

                showToast('Purchase successful! Check your email.', 'success');
                return payment;
            }

        } catch (error) {
            console.error('Purchase failed:', error);
            showToast(error.message || 'Purchase failed', 'error');
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Add purchase to local storage
     * @param {Object} book - Book details
     * @param {Object} buyer - Buyer details
     * @param {Object} payment - Payment details
     */
    addToPurchases(book, buyer, payment) {
        const purchases = JSON.parse(localStorage.getItem('myPurchases') || '[]');
        
        purchases.unshift({
            id: book.id,
            title: book.title,
            author: book.author,
            price: book.price,
            image: book.image,
            seller: book.seller || 'Unknown Seller',
            sellerId: book.sellerId,
            paymentId: payment.paymentId,
            orderId: payment.orderId,
            purchasedAt: new Date().toISOString(),
            status: 'completed'
        });

        localStorage.setItem('myPurchases', JSON.stringify(purchases));

        // Add activity
        if (window.addActivity) {
            window.addActivity(`Purchased "${book.title}" for ₹${book.price}`, 'fa-shopping-cart');
        }
    }

    /**
     * Get payment methods display names
     */
    getPaymentMethodName(method) {
        const methods = {
            'card': 'Credit/Debit Card',
            'netbanking': 'Net Banking',
            'wallet': 'Wallet',
            'emi': 'EMI',
            'upi': 'UPI'
        };
        return methods[method] || method;
    }
}

// Create global instance
const paymentService = new PaymentService();

// Make available globally
window.paymentService = paymentService;

/**
 * Helper function to initiate book purchase
 * @param {Object} book - Book object with id, title, price, etc.
 */
async function buyBook(book) {
    // Get buyer details from localStorage
    const buyer = {
        id: localStorage.getItem('userId') || 'guest',
        name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
        mobile: localStorage.getItem('userMobile') || ''
    };

    if (!localStorage.getItem('loggedIn')) {
        showToast('Please login to purchase', 'error');
        openModal('loginModal');
        return;
    }

    if (!buyer.email) {
        showToast('Please complete your profile with email', 'error');
        return;
    }

    // Confirm purchase
    const confirmed = confirm(`Purchase "${book.title}" for ₹${book.price}?`);
    if (!confirmed) return;

    // Process payment
    const result = await paymentService.purchaseBook(book, buyer);
    
    if (result.success) {
        // Refresh dashboard if open
        if (document.getElementById('myPurchases')) {
            if (window.loadMyPurchases) {
                window.loadMyPurchases();
            }
        }
    }

    return result;
}
