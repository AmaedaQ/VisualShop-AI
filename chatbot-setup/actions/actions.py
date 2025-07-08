import requests
import logging
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import re
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class ActionFetchProducts(Action):
    def name(self):
        return "action_fetch_products"

    def run(self, dispatcher, tracker, domain):
        query = tracker.latest_message.get("text").lower()
        logger.debug(f"Fetching products for query: {query}")

        # Extract search term (e.g., "watch" from "search for watch")
        search_terms = ["search for", "find", "show me", "look for", "search"]
        for term in search_terms:
            if term in query:
                query = query.replace(term, "").strip()
                break

        if not query:
            logger.debug("No valid search query provided")
            dispatcher.utter_message("Please specify what you're looking for, e.g., 'search for watch' or 'show me shoes'.")
            return []

        try:
            api_url = f"http://localhost:5000/api/products/search?query={query}"
            logger.debug(f"Calling product search API: {api_url}")
            response = requests.get(api_url, timeout=10)
            response.raise_for_status()
            data = response.json()
            logger.debug(f"Product API response: {data}")

            if data.get("success") and data.get("products"):
                product_messages = []
                for product in data["products"]:
                    product_id = product.get("id", "N/A")
                    name = product.get("name", "Unknown Product")
                    price = product.get("price", "N/A")
                    rating = product.get("rating", "N/A")
                    details_url = f"http://localhost:3000/product/{product_id}"

                    message = f"- **{name}**  \n💰 *Price:* ${price}  \n⭐ *Rating:* {rating}/5  \n🔗 [View Details]({details_url})"
                    product_messages.append(message)

                dispatcher.utter_message("Here are some products that match your search:\n\n" + "\n\n".join(product_messages) + "\n\nWould you like to refine your search or check something else?")
            else:
                logger.debug(f"No products found for query: {query}")
                dispatcher.utter_message(f"Sorry, I couldn’t find any products matching '{query}'. Try something like 'watch' or 'shoes'.")
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching products: {str(e)}")
            dispatcher.utter_message("There was an issue fetching product details. Please try again later.")
        except Exception as e:
            logger.error(f"Unexpected error in action_fetch_products: {str(e)}")
            dispatcher.utter_message("Something went wrong while searching for products. Please try again or contact support.")

        return []

class ActionTrackOrder(Action):
    def name(self):
        return "action_track_order"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        user_message = tracker.latest_message.get("text", "")
        logger.debug(f"User message for tracking: {user_message}")

        order_id = tracker.get_slot("order_id") or self.extract_order_id(user_message)
        logger.debug(f"Extracted order_id: {order_id}")

        if not order_id:
            dispatcher.utter_message(
                text="🔍 Please provide your order ID to track your order (it looks like: ORD-1749157242407-CC7F3879)."
            )
            return []

        if not self.is_valid_order_id(order_id):
            logger.debug(f"Invalid order ID provided: {order_id}")
            dispatcher.utter_message(response="utter_invalid_order_id")
            return []

        try:
            api_url = f"http://localhost:5000/api/orders/public/{order_id}"
            logger.debug(f"Calling API: {api_url}")
            response = requests.get(api_url, timeout=10)
            response.raise_for_status()
            data = response.json()
            logger.debug(f"Order API response: {data}")

            if data.get("success") and data.get("order"):
                order = data["order"]
                message = self.format_order_response(order, order_id)
                logger.debug(f"Formatted message: {message}")
                dispatcher.utter_message(text=message)
                dispatcher.utter_message(
                    text="Is there anything else I can assist you with?"
                )
                return [SlotSet("order_id", order_id)]
            else:
                logger.debug(f"No order found for ID: {order_id}")
                dispatcher.utter_message(
                    text="❌ I couldn't find an order with that ID. Please double-check your order number and try again, or contact our customer service for assistance."
                )
        except requests.exceptions.Timeout:
            logger.error("API request timed out")
            dispatcher.utter_message(
                text="⏱️ The request is taking longer than expected. Please try again in a moment."
            )
        except requests.exceptions.ConnectionError:
            logger.error("API connection error")
            dispatcher.utter_message(
                text="🔌 I'm having trouble connecting to our order system. Please try again later or contact customer service."
            )
        except requests.RequestException as e:
            logger.error(f"API request failed: {str(e)}")
            dispatcher.utter_message(
                text="❌ Something went wrong while tracking your order. Please try again or contact our support team for assistance."
            )
        except Exception as e:
            logger.error(f"Unexpected error in action_track_order: {str(e)}")
            dispatcher.utter_message(
                text="❌ An unexpected error occurred. Please try again or contact support at support@company.com."
            )

        return []

    def extract_order_id(self, text: str) -> str:
        logger.debug(f"Extracting order ID from text: {text}")
        order_pattern = r'ORD-\d{13}-[A-F0-9]{8}'
        match = re.search(order_pattern, text.upper())
        
        if match:
            logger.debug(f"Found order ID: {match.group()}")
            return match.group()
        
        alternative_patterns = [
            r'ORD-\d+-[A-F0-9]+',
            r'[A-Z]{3}-\d{13}-[A-F0-9]{8}'
        ]
        
        for pattern in alternative_patterns:
            match = re.search(pattern, text.upper())
            if match:
                logger.debug(f"Found order ID with alternative pattern: {match.group()}")
                return match.group()
        
        logger.debug("No order ID found")
        return None

    def is_valid_order_id(self, order_id: str) -> bool:
        if not order_id:
            return False
        pattern = r'^ORD-\d{13}-[A-F0-9]{8}$'
        is_valid = bool(re.match(pattern, order_id.upper()))
        logger.debug(f"Order ID {order_id} is valid: {is_valid}")
        return is_valid

    def format_order_response(self, order: dict, order_id: str) -> str:
        logger.debug(f"Formatting order response for order_id: {order_id}, data: {order}")
        try:
            order_id = order.get("orderId", order_id)
            first_name = order.get("shippingFirstName", "N/A")
            last_name = order.get("shippingLastName", "")
            full_name = f"{first_name} {last_name}".strip() or "N/A"
            address = order.get("shippingAddress", "N/A")
            payment_method = self.format_payment_method(order.get("paymentMethod", "N/A"))
            total_amount = order.get("totalAmount", "0.00")
            status = self.format_status(order.get("status", "Unknown"))
            created_at = self.format_date(order.get("createdAt", ""))
            updated_at = self.format_date(order.get("updatedAt", ""))

            message = f"""📦 **Order Tracking Details**

**Order ID:** {order_id}  
**Customer:** {full_name}  
**Shipping Address:** {address}  
**Payment Method:** {payment_method}  
**Total Amount:** ${total_amount}  
**Status:** {status}  
**Order Placed:** {created_at}  
**Last Updated:** {updated_at}"""

            status_lower = order.get("status", "").lower()
            if status_lower == "pending":
                message += "\n\nYour order is being processed. We'll notify you once it’s on its way."
            elif status_lower == "processing":
                message += "\n\nGreat news! Your order is currently being prepared for shipment."
            elif status_lower == "shipped":
                message += "\n\nYour order is on its way. You’ll receive it soon!"
            elif status_lower == "delivered":
                message += "\n\nYour order has been successfully delivered. We hope you’re delighted with your purchase! 😊"
            elif status_lower == "cancelled":
                message += "\n\nThis order has been cancelled. Please contact support if you have any questions."

            return message
        except Exception as e:
            logger.error(f"Error formatting order response for order_id {order_id}: {str(e)}")
            return f"❌ Failed to format order details for {order_id}. Please try again or contact support."

    def format_payment_method(self, payment_method: str) -> str:
        method_map = {
            "cod": "Cash on Delivery",
            "card": "Credit/Debit Card",
            "paypal": "PayPal",
            "stripe": "Credit Card (Stripe)",
            "razorpay": "Online Payment",
            "": "N/A"
        }
        return method_map.get(payment_method.lower(), payment_method.title())

    def format_status(self, status: str) -> str:
        status_map = {
            "pending": "Pending",
            "processing": "Processing",
            "shipped": "Shipped",
            "delivered": "Delivered",
            "cancelled": "Cancelled",
            "refunded": "Refunded",
            "": "Unknown"
        }
        return status_map.get(status.lower(), status.title())

    def get_status_emoji(self, status: str) -> str:
        emoji_map = {
            "pending": "⏳",
            "processing": "🔄",
            "shipped": "🚚",
            "delivered": "✅",
            "cancelled": "❌",
            "refunded": "💰",
            "": "📦"
        }
        return emoji_map.get(status.lower(), "📦")

    def format_date(self, date_string: str) -> str:
        if not date_string:
            return "N/A"
        try:
            dt = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
            return dt.strftime("%B %d, %Y at %I:%M %p")
        except Exception as e:
            logger.error(f"Failed to parse date {date_string}: {str(e)}")
            return "N/A"
