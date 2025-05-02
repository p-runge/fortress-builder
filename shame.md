# List of Tech Deps to Be Ashamed About

## Relational Integrity Checks

There currently are relational integrity checks done in the tRPC context middlware which is fired on every request to any tRPC endpoint. These checks are requesting the DB to ensure there are no missing relations to the user model.

While this is nice in regards of data integrity it is also slow. It currently takes about 50-100ms on prod which is a not so nice thing to do on every request.
