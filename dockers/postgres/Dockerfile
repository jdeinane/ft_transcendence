FROM debian:latest

RUN apt-get update && \
	apt-get upgrade && \
	apt-get isnstall -y --no-install-recommends \
	wget \
	postgresql-server \
	postgresql-client \
	procps && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/*

COPY conf/50-server.cnf /etc/postgresql/postgresql.conf.d/50-server.cnf
COPY .tools/psql_script.sh ./

RUN mkdir -p /var/run/postgresql
RUN chown postgresql:postgresql /var/run/postgresql/
RUN chmod -R 755 /var/run/postgresql

RUN mkdir -p /var/lib/postgresql
RUN chown postgresql:postgresql /var/lib/postgresql
RUN chmod -R 755 /var/lib/postgresql

RUN chmod -x ./psql_script.sh

ENTRYPOINT ["bash", "./psql_script.sh"]

EXPOSE 3306
