# Airbnb checkout reminder

## Disclaimer

Airbnb-checkout-reminder will no longer be maintained and it would not work as expected in the future.
The reason for this is that it's extremely difficult to bypass Gmail/Airbnb api protections.
They uses their own api protection mechanism, such as RECHAPCHA and Airlock.
It means your app can suddenly stop working at any moment throwing errors such as 'Cannot find element: xxx timeout 30000s'.
I'm currently working on version2 of this app which doesn't uses either Gmail or Airbnb api.

## Features

- It sends predefined check-in/check-out messages at a set time
- It responds to certain type of messages like reservation-confirmation
  and sends gmail notification after finishing the job

## Read More

- [medium - English](https://medium.com/@leejh3224/build-airbnb-check-out-reminder-with-node-js-and-puppeteer-ab0791473347)
- [velog - 한국어](https://velog.io/@leejh3224/Node.js%EC%99%80-Puppeteer%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-Airbnb-checkout-reminder)

## Getting Started

If you're interested and want to build your own on your local machine or whatever,
Then follow the instructions below.

1. Copy `.env.example` and change the content of it

   ```bash
   cp .env.example .env
   # now change the content of .env file
   ```

2. Download `service-account-key.json` in whatever path you specified in `.env`.

   Checkout [creating-managing-service-account-keys](https://cloud.google.com/iam/docs/creating-managing-service-account-keys?hl=en) for more info.

   `service-account-key` is required to use [Cloud Translation Api](https://cloud.google.com/translate/?utm_source=google&utm_medium=cpc&utm_campaign=japac-KR-all-en-dr-skws-all-all-trial-e-dr-1003987&utm_content=text-ad-none-none-DEV_c-CRE_252621121562-ADGP_Hybrid%20%7C%20AW%20SEM%20%7C%20SKWS%20~%20T1%20%7C%20EXA%20%7C%20ML%20%7C%20M:1%20%7C%20KR%20%7C%20en%20%7C%20Translation%20%7C%20API-KWID_43700024740528636-kwd-353674897585&userloc_1009871&utm_term=KW_cloud%20translation%20api&gclid=Cj0KCQiAtvPjBRDPARIsAJfZz0qboGqrBXpT2fxczSuC-G2ZNwDQkksAuG1ds9YoF4_TgUhke4hnyqMaAtljEALw_wcB).

3. Downalod `oauth2.keys.json` under root directory.

   Checkout [Using OAuth 2.0 to Access Google APIs](https://developers.google.com/identity/protocols/OAuth2) for more info.

   This is required to get OAuth 2.0 Access for your Gmail account.

4. Find your `GOOGLE_PROJECT_ID` in the [GCP dashboard](https://console.cloud.google.com/home/dashboard)

   Replace `GOOGLE_PROJECT_ID` in your `.env` file.

5. Make sure you've created label for all of your airbnb mails

   Checkout [create filtering rules](https://support.google.com/mail/answer/6579?hl=en) for more info.

   And add its id in `.env` file. (replace `AIRBNB_MAIL_LABEL_ID`)

6. (Optional) If you want to receive error logs via Gmail notification, \
   you can create filter to contain the word "에러" which means "error" in english.

   This is optional step but you'll find this helpful when you can't access Airbnb inbox.

## Tips

1. Use [Google Chrome RemoteDesktop](https://remotedesktop.google.com/home) service when you're using GCP VMs and want to debug in with GUI.

2. Transfer files, ex. credentials keys through [GoogleDrive](https://www.google.com/drive/) when needed.

3. Manage your node process with PM2. They are definitely goto solution for managing node processes.

## Closing

If you have any question or suggestion, please leave an issue.
