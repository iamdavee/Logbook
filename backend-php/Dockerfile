FROM php:8.2-apache

# Enable Apache modules
RUN a2enmod rewrite headers

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Copy application files
COPY . /var/www/html/

# Allow .htaccess overrides and enable CORS headers module
RUN echo '<Directory /var/www/html>\n\
    Options -Indexes\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/logbook.conf \
    && a2enconf logbook

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html \
    && mkdir -p /var/www/html/uploads \
    && chmod 755 /var/www/html/uploads

EXPOSE 80
