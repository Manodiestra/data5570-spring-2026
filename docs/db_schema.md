# Database Schema Documentation

## Overview
This document describes the database schema for the auction management Django application.

## Models

### User
**Note:** Uses Django's built-in `django.contrib.auth.models.User` model.

- `id` (Primary Key)
- `username` (String, unique)
- `email` (String)
- `first_name` (String)
- `last_name` (String)
- `is_staff` (Boolean) - Used to identify admin users
- `is_active` (Boolean)
- `date_joined` (DateTime)
- `last_login` (DateTime)

**Additional considerations:**
- Admin users (with `is_staff=True`) can manage auction events
- Regular users can view auction events and publish items
- All users can place bids on items

---

### AuctionEvent
Represents an auction event that contains multiple auction items.

**Fields:**
- `id` (Primary Key, Auto-increment)
- `name` (CharField, max_length=200) - Name of the auction event
- `city` (CharField, max_length=100) - City location
- `state` (CharField, max_length=50) - State location
- `zip_code` (CharField, max_length=10) - ZIP code
- `start_datetime` (DateTimeField) - When the auction opens
- `end_datetime` (DateTimeField) - When the auction closes
- `created_at` (DateTimeField, auto_now_add=True) - Record creation timestamp
- `updated_at` (DateTimeField, auto_now=True) - Record update timestamp
- `created_by` (ForeignKey to User) - Admin who created the event
- `is_active` (BooleanField, default=True) - Whether the event is currently active

**Relationships:**
- One-to-Many with `AuctionItem` (an event has many items)
- Many-to-One with `User` (created_by)

**Indexes:**
- Index on `start_datetime` and `end_datetime` for querying active auctions
- Index on `is_active` for filtering active events

---

### AuctionItem
Represents an item that is being auctioned.

**Fields:**
- `id` (Primary Key, Auto-increment)
- `auction_event` (ForeignKey to AuctionEvent) - The auction event this item belongs to
- `name` (CharField, max_length=200) - Name of the item
- `description` (TextField) - Detailed description of the item
- `image_url` (URLField, max_length=500, blank=True, null=True) - URL to item image (S3 bucket)
- `owner` (ForeignKey to User) - User who published/owns this item
- `starting_price` (DecimalField, max_digits=10, decimal_places=2) - Initial/starting price
- `current_price` (DecimalField, max_digits=10, decimal_places=2) - Current highest bid price
- `status` (CharField, choices=[('draft', 'Draft'), ('published', 'Published'), ('sold', 'Sold'), ('cancelled', 'Cancelled')], default='draft') - Item status
- `created_at` (DateTimeField, auto_now_add=True) - Record creation timestamp
- `updated_at` (DateTimeField, auto_now=True) - Record update timestamp
- `sold_at` (DateTimeField, null=True, blank=True) - When the item was sold (if applicable)
- `sold_to` (ForeignKey to User, null=True, blank=True) - User who won the auction (if sold)

**Relationships:**
- Many-to-One with `AuctionEvent` (items belong to an event)
- Many-to-One with `User` (owner)
- One-to-Many with `Bid` (item has many bids)
- Many-to-One with `User` (sold_to - winner)

**Indexes:**
- Index on `auction_event` for filtering items by event
- Index on `status` for filtering by item status
- Index on `owner` for user's items
- Index on `current_price` for sorting by price

---

### Bid
Tracks all bids placed on auction items, maintaining a complete price history.

**Fields:**
- `id` (Primary Key, Auto-increment)
- `auction_item` (ForeignKey to AuctionItem) - The item being bid on
- `bidder` (ForeignKey to User) - User who placed the bid
- `amount` (DecimalField, max_digits=10, decimal_places=2) - Bid amount
- `placed_at` (DateTimeField, auto_now_add=True) - When the bid was placed
- `is_winning_bid` (BooleanField, default=False) - Whether this is currently the winning bid
- `is_outbid` (BooleanField, default=False) - Whether this bid was outbid by a higher bid

**Relationships:**
- Many-to-One with `AuctionItem` (bids belong to an item)
- Many-to-One with `User` (bidder)

**Indexes:**
- Index on `auction_item` for querying bids by item
- Index on `bidder` for querying user's bids
- Index on `placed_at` for chronological ordering
- Composite index on (`auction_item`, `placed_at`) for efficient bid history queries
- Index on `is_winning_bid` for finding current winning bid

**Business Logic:**
- When a new bid is placed, it should be validated to be higher than the current highest bid
- The `current_price` on the `AuctionItem` should be updated to the new bid amount
- Previous winning bids should be marked as `is_outbid=True` and `is_winning_bid=False`
- The new bid should be marked as `is_winning_bid=True`

---

## Database Relationships Summary

```
User (1) ──< (Many) AuctionEvent.created_by
User (1) ──< (Many) AuctionItem.owner
User (1) ──< (Many) AuctionItem.sold_to
User (1) ──< (Many) Bid.bidder

AuctionEvent (1) ──< (Many) AuctionItem.auction_event

AuctionItem (1) ──< (Many) Bid.auction_item
```

---

## Additional Considerations

### Validation Rules
1. **AuctionEvent:**
   - `end_datetime` must be after `start_datetime`
   - ZIP code should be validated for format

2. **AuctionItem:**
   - `starting_price` and `current_price` must be positive
   - `current_price` should be >= `starting_price`
   - Item can only be published if it belongs to an active auction event
   - Item status transitions should be validated (e.g., can't sell a cancelled item)

3. **Bid:**
   - `amount` must be greater than the current highest bid
   - Bids can only be placed on published items
   - Bids can only be placed during the auction event's active time window
   - Users cannot bid on their own items
   - Bid amount must be positive

### Future Enhancements
- Consider adding a `minimum_bid_increment` field to `AuctionItem` to enforce bid increments
- Consider adding a `reserve_price` field to `AuctionItem` for items with minimum selling price
- Consider adding bid notifications/email alerts when users are outbid
- Consider adding a `category` field to `AuctionItem` for categorization
- Consider adding soft delete functionality (is_deleted flag) instead of hard deletes
- Consider adding audit logging for admin actions on auction events

