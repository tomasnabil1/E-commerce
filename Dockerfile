FROM nginx:alpine
COPY index.html /usr/share/nginx/html/
COPY pages/ /usr/share/nginx/html/pages/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY images/ /usr/share/nginx/html/images/
COPY webfonts/ /usr/share/nginx/html/webfonts/
COPY style.css /usr/share/nginx/html/
COPY darkmode.js /usr/share/nginx/html/
COPY cart.js /usr/share/nginx/html/
COPY search.js /usr/share/nginx/html/
EXPOSE 80