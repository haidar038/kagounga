# Retrieve an Order

## Endpoint

```
GET /v1/orders/:id
```

## Response

```
{
  "success": true,
  "message": "Order successfully retrieved",
  "object": "order",
  "id": "5dd599ebdefcd4158eb8470b",
  "draft_order_id": null,
  "short_id": "URf_UO2nY3V",
  "shipper": {
    "name": "Amir",
    "email": "biteship@example.com",
    "phone": "088888888888",
    "organization": "Biteship Org"
  },
  "origin": {
    "contact_name": "Amir",
    "contact_phone": "088888888888",
    "address": "Plaza Senayan, Jalan Asia Afrik...",
    "note": "Deket pintu masuk STC",
    "postal_code": 10270,
    "coordinate": {
      "latitude": -6.2253114,
      "longitude": 106.7993735
    }
  },
  "destination": {
    "contact_name": "John Doe",
    "contact_phone": "088888888888",
    "contact_email": "jon@example.com",
    "address": "Lebak Bulus MRT...",
    "note": "Near the gas station",
    "proof_of_delivery": {
      "use": false,
      "fee": 0,
      "note": null,
      "link": null
    },
    "postal_code": 12310,
    "coordinate": {
      "latitude": -6.28927,
      "longitude": 106.77492000000007
    },
    "cash_on_delivery": {
      "id": null,
      "amount": 0,
      "amount_currency": "IDR",
      "fee": 0,
      "fee_currency": "IDR",
      "note": null,
      "type": null
    }
  },
  "delivery": {
    "datetime": "2023-09-24T12:00+07:00",
    "note": null,
    "type": "now",
    "distance": 15.2,
    "distance_unit": "kilometer"
  },
  "voucher": {
    "id": null,
    "name": null,
    "value": null,
    "type": null
  },
  "courier": {
    "tracking_id": "65ddac3879699035b83dc561",
    "waybill_id": "WYB-1112223333442",
    "company": "jnt",
    "history": [
      {
        "service_type": "-",
        "status": "confirmed",
        "note": "Order has been confirmed. Locating nearest driver to pickup.",
        "updated_at": "2021-01-11T14:03:41+07:00"
      },
      {
        "service_type": "-",
        "status": "allocated",
        "note": "Courier has been allocated. Waiting to pick up.",
        "updated_at": "2021-01-11T15:49:25+07:00"
      }
    ],
    "link": "https://example.com/10298309123809",
    "name": "John Doe",   // Deprecated
    "phone": "0888888888",  // Deprecated
    "driver_name": "John Doe",
    "driver_phone": "0888888888",
    "driver_photo_url": "https://picsum.photos/200",
    "driver_plate_number": "B 1234 ABC",
    "type": "instant",
    "shipment_fee": 25000,
    "insurance": {
      "amount": 500000,
      "amount_currency": "IDR",
      "fee": 2500,
      "fee_currency": "IDR",
      "note": null
    },
    "routing_code": "123-JKT45A-67"
  },
  "reference_id": null,
  "invoice_id": null,
  "items": [
    {
      "name": "Black L",
      "description": "Feast/Bangkok'19 Invasion",
      "sku": null,
      "value": 165000,
      "quantity": 1,
      "length": 72,
      "width": 54,
      "height": 1,
      "weight": 200
    }
  ],
  "extra": null,
  "metadata": null,
  "tags": [],
  "note": "Please be careful",
  "currency": "IDR",
  "tax_lines": [],
  "price": 27500,
  "status": "allocated",
  "ticket_status": null
}
```
