
# go-certbot

A npx-able repo to invoke certbot to do its thing.

## TL; DR

Make sure you have a cert store at ~/.go-certbot. If not, fetch it:

```shell
mkdir -p "${HOME}/.go-certbot"
aws s3 sync s3://z-cdr0-thinking/project/cdr0/front/le/go-certbot/ "${HOME}/.go-certbot/"
```

To create a cert for `my.example.com`:

```shell
npx github:briancsparks/go-certbot example.com my.example.com me@example.com
ls -l ~/.go-certbot/certs/config/live/my.example.com
```

Then push back to S3:

```shell
aws s3 sync "${HOME}/.go-certbot/" s3://z-cdr0-thinking/project/cdr0/front/le/go-certbot/
```

## Details

Uses Let's Encrypt (certbot) to generate a server certificate for your subdomain.
For example, `my.example.com`, using Route-53 as the DNS challenge responder.

* Uses AWS Route-53 to prove to certbot that you control the owning domain
  (`example.com`.)
  * So, obviously, you must own the domain and manage it with Route-53.
  * You must have AWS credentials setup on the machine running go-certbot.
* Must have certbot installed. If not, see below.

#### Installing certbot

Ubuntu:

```shell
sudo apt-add-repository -y ppa:certbot/certbot
sudo apt-get update
sudo apt-get install -y certbot
```

## Results

The results are put into `~/.go-certbot/...`

* The cert: `~/.go-certbot/certs/config/live/my.example.com/fullchain.pem`
* The key: `~/.go-certbot/certs/config/live/my.example.com/privkey.pem`

## Other

The commands that I always end up needing next are at:

* https://www.sslshopper.com/article-most-common-openssl-commands.html
* https://www.sslshopper.com/ssl-converter.html

