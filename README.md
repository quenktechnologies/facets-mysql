
# MySQL Facets

> Faceted search compiler for use with node mysql.

Turns input like `type:c created_by:ffan client.name:%"Bally Valentine%"`

into

```sql
 
 -- Provides everything after the WHERE keyword
  SELECT * FROM users WHERE type = 'c' AND created_by = ffan AND client.name LIKE "Bally Valentine%"

```

## License

Apache 2.0 (SEE LICENSE) file. (c) Quenk Technologies Limited.
