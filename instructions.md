# Create docker network first

`docker network create postgres-database`

# Pull postgres image from docker hub

`docker pull postgres`

# Pull postgres image from docker hub

`docker pull dpage/pgadmin4`

# Start postgres instance in docker

`docker run -d --name postgres -e POSTGRES_USER="postgres" -e POSTGRES_PASSWORD="postgres" -v postgres-database:/var/lib/postgresql/data -p 5433:5432 --network postgres-database postgres`

# Start pgadmin instance in docker

`docker run -d -e PGADMIN_DEFAULT_EMAIL="admin@admin.com" -e PGADMIN_DEFAULT_PASSWORD="root" -p 8080:80 --network postgres-database --name pgadmin dpage/pgadmin4`

# Connect pgadmin and postgres

The hostname should be `host.docker.internal` others will be as expected

# Connect Postgres Database server remotely

`psql -h [server-ip-address] -p [port] -d [database-name] -U [username]`

# Postgres Setup Instructions

First, you should install prerequisite software packages that will be used to download and install software certificates for a secure SSL connection.
`sudo apt install wget ca-certificates`

Then, get the certificate, add it to apt-key management utility and create a new configuration file with an official PostgreSQL repository address inside.
`wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -`
`sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'`

It is always a good idea to download information about all packages available for installation from your configured sources before the actual installation.
`sudo apt update`
`apt install postgresql postgresql-contrib`

Check PostgreSQL status
`service postgresql status`

Start Using PostgreSQL Command Line Tool
`sudo -u postgres psql`

Create new password
`\password postgres`

Create and Populate a New Database
You are now connected to your database server through psql command line tool with full access rights, so it’s time to create a new database.
`CREATE DATABASE database_name;`

Setup PostgreSQL server
access postgresql.conf configuration file of PostgreSQL version 14 by using vim text editor.

`vim /etc/postgresql/15/main/postgresql.conf`

Uncomment and edit the listen_addresses attribute to start listening to start listening to all available IP addresses.
`listen_addresses = '*'`

Now edit the PostgreSQL access policy configuration file.
`vim /etc/postgresql/15/main/pg_hba.conf`

Append a new connection policy (a pattern stands for [CONNECTION_TYPE][DATABASE][USER] [ADDRESS][METHOD]) in the bottom of the file.
`host all all 0.0.0.0/0 md5`

It is now time to restart your PostgreSQL service to load your configuration changes.
`systemctl restart postgresql`

Let’s now connect to a remote PostgreSQL database that we have hosted on one of the Cherry Servers machines.
`psql -h <server-ip-address> -p 5432 -d <database-name> -U postgres`

# Deployment Instructions

First login to the server via ssh
`ssh root@server-ip-address`

Run these commands for update and upgrade latest version of the available softwares
`sudo apt update`
`sudo apt upgrade`

Install Node.js through nvm and setup nvm path
`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash`

Install LTS version of currently available Node.js in my case it v16.20.0
`nvm install v16.20.0`

Clone your project from Github
`git clone your-project.git`

Setup PM2 process manager to keep your app running
`npm i pm2 -g`
`pm2 start app`
`pm2 show app`
`pm2 status`
`pm2 restart app`
`pm2 stop app`
`pm2 logs`

Create ecosystem.config.js file for running application via pm2

```
module.exports = {
  apps: [
    {
      name: 'POC01_EWN_Backend',
      script: '/var/www/poc01_ewn_backend/build/server.js',
      watch: true,
      force: true,
      env: {
        PORT:4000,
        NODE_ENV: 'production',
        DATABASE_URL:"",
        SECRET_SALT:"",
        SECRET_KEY:"",
      },
    },
  ],
};
```

Setup ufw firewall
`sudo ufw enable`
`sudo ufw status`
`sudo ufw allow ssh` (Port 22)
`sudo ufw allow http` (Port 80)
`sudo ufw allow https` (Port 443)

Install NGINX and configure
`sudo apt install nginx`
`sudo nano /etc/nginx/sites-available/default`

Add the following to the location part of the server block

```
server_name yourdomain.com www.yourdomain.com;

location / {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Check NGINX config
`sudo nginx -t`

Restart NGINX
`sudo service nginx restart`

Add SSL with LetsEncrypt
`sudo add-apt-repository ppa:certbot/certbot`
`sudo apt-get update`
`sudo apt-get install python-certbot-nginx`
`sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com`

Only valid for 90 days, test the renewal process with
`certbot renew --dry-run`
