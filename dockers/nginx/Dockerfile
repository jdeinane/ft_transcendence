FROM nginx:1.27

# remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# copy nginx configuration
COPY dockers/nginx/conf/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD [ "nginx", "-g", "daemon off;" ]
