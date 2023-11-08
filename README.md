<div align="center">
<a href="https://tableflow.com"><img src="https://tableflow-assets-cdn.s3.amazonaws.com/TableFlow-readme-header.png" width="600" alt="TableFlow"></a>

<em>The Open Source CSV Importer</em>

<h3>
    <a href="https://tableflow.com/docs">Docs</a> |
    <a href="https://join.slack.com/t/tableflow/shared_invite/zt-1psu47idh-vnItf_BaWcIWih8flGZ0fw">Slack</a> |
    <a href="https://twitter.com/tableflow">Twitter</a> |
    <a href="https://tableflow.com">Website</a> 
</h3>

</div>

## TableFlow is an open source data import platform

* Embeddable import iframe modal
* No-code importer configuration
* Smart column mapping
* Frontend callbacks to retrieve data
* API to retrieve data
* Webhook notifications
* Data validation (coming soon)

## How it works

1. Create an Importer and define the columns your users can import
2. Embed the TableFlow Importer in your app
3. Your users can upload CSV or Excel files and set the column mapping through the Importer modal
4. Download the clean, mapped data from TableFlow via a callback, the API, or from the admin app

![TableFlow Importer Modal](https://tableflow-assets-cdn.s3.amazonaws.com/importer-modal-20230613b.png)

## Get started

### ☁️ TableFlow Cloud

The quickest way to get started with TableFlow is signing up for free
to [TableFlow Cloud](https://app.tableflow.com/signup)

### 👩‍💻 Self-hosted deploy (local)

You can run TableFlow locally with Docker:

```bash
git clone https://github.com/tableflowhq/tableflow.git
cd tableflow
cp .env.example .env
docker compose up -d
```

Then open [http://localhost:3000](http://localhost:3000) to access TableFlow.

### 🤖 Self-hosted deploy (AWS EC2)

**Important notes:**

1. [x] Make sure the server you use is only accessible within your VPC
2. [x] Make sure your local machine is able to connect to the server on ports 3000 (the web server)
3. [x] Update your network settings to allow port 3001 (the importer iframe) and 3003 (the API server) to be accessible
   from where your users will import data, most likely public
4. [x] Update `TABLEFLOW_WEB_APP_URL` and `TABLEFLOW_WEB_IMPORTER_URL` in your .env.example file with the correct URLs
   where you'll access the web applications from

One-line install script (for Amazon Linux 2):

```bash
sudo yum update -y && \
sudo yum install -y git && \
sudo amazon-linux-extras install docker -y && \
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker} && \
mkdir -p $DOCKER_CONFIG/cli-plugins &&\
curl -SL https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose &&\
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose &&\
sudo service docker start && \
sudo systemctl enable docker && \
sudo usermod -a -G docker $USER && \
mkdir tableflow && cd tableflow && \
wget https://raw.githubusercontent.com/tableflowhq/tableflow/main/{.env.example,docker-compose.yml,docker-compose.base.yml} && \
mv .env.example .env && \
sg docker -c 'docker compose up -d'
```

## Get in touch

Let us know your feedback or feature requests! You can submit a GitHub issue, reach out
over [Slack](https://join.slack.com/t/tableflow/shared_invite/zt-1psu47idh-vnItf_BaWcIWih8flGZ0fw), or email us
at [hey@tableflow.com](mailto:hey@tableflow.com)

### DB Webhooks

If you're looking to use DB Webhooks, we've moved the project into its own
repository [here](https://github.com/tableflowhq/db-webhooks)!
