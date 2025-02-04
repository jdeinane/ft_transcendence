FROM postgres:15

# copy PostgreSQL configuration
COPY ./50-server.cnf /etc/postgresql/postgresql.conf

EXPOSE 8000

# launch postgres in production
CMD ["postgres"]
