function orderfunction(event) {
    event.preventDefault();

    const amount = 50000; // ₹500 in paise

    axios.post('http://localhost:3111/api/orderPremium', { amount })
        .then(response => {
            const order = response.data;

            // ✅ If backend returns an error field (optional safeguard)
            if (order.error) {
                alert(order.error);
                return;
            }

            // ✅ Razorpay options setup
            let options = {
                key: "rzp_test_lDq4N8E6yOFs6n",  // Your Razorpay key
                amount: order.amount,
                currency: order.currency,
                name: "The Expense Funda",
                description: 'Payment for premium subscription',
                order_id: order.id,  // Razorpay order ID from backend
                handler: function (response) {
                    axios.post('http://localhost:3111/api/orderverifyPremium', {
                        paymentId: response.razorpay_payment_id,
                        orderId: response.razorpay_order_id,
                        signature: response.razorpay_signature
                    }, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                          }
                    })
                    .then(res => {
                        const { token } = res.data;
                        if (token) {
                            localStorage.setItem("token", token);
                        }
                
                        document.getElementById('buyPremium')?.setAttribute('hidden', 'true');
                        document.getElementById('LeaderboardBtn')?.removeAttribute('hidden');
                        document.getElementById('download-csv-btn')?.removeAttribute('hidden');
                    })
                    .catch(error => {
                        console.error('Error verifying payment:', error);
                        alert('Payment verification failed. Please contact support.');
                    });
                },

                prefill: {
                    name: "John Doe",          
                    email: "john@example.com",
                    contact: "9999999999"
                },

                theme: {
                    color: "#F37254"
                }
            };

            let rzp = new Razorpay(options);
            rzp.open();

            // Optional: handle case when payment is closed/cancelled
            rzp.on('payment.failed', function (response) {
                alert('Payment failed or cancelled. Please try again.');
                console.error(response.error);
            });

        })
        .catch(error => {
            console.error("Error creating order:", error);
            alert('Something went wrong while creating the order. Please try again later.');
        });
}
