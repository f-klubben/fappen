# GET: api/member/payment/qr
IN: ```{member_id}```
OUT: SVG
# GET: api/member/active
IN: ```{member_id}```
OUT: ```{active}```
# GET: api/member/sales
IN: ```{member_id}```
OUT: ```{sales: [{timestamp, product, price}]}```
# GET: api/member/get_id
IN: ```{username}```
OUT: ```{member_id}```
# GET: api/member/balance
IN: ```{member_id}```
OUT: ```{balance}```
# GET: api/member
IN: ```{member_id}```
OUT: ```{
    balance,
    username,
    active,
    name,
}```
# GET: api/products/named_products
OUT: ```{item.name: item.product.id}```
# GET: api/products/active_products
IN: ```{room_id}```
OUT: ```{item_id: [name, price]}```
# GET?: api/products/category_mappings
OUT: ```{product_id: [(category_id, catergory_name)]}```
# POST: api/sale 

IN: ```{buystring, room, member_id}```
OUT:
```
{
  status,
  msg,
  values: {
    order: {
      room,
      member,
      created_on,
      items
    },
    promille,
    is_ballmer_peaking
    bp_minutes,
    bp_seconds,
    caffeine,
    cups,
    product_contains_caffeine,
    is_coffee_master,
    cost,
    give_multibuy_hint,
    sale_hints
  }
}
```