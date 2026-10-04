# AWS S3 Static Website

Practical activity for the Self-Learning Report on **AWS Cloud Practitioner Essentials**.


## Problem Statement
To host a static website on the AWS Cloud using Amazon S3 and understand how core AWS services are configured through the AWS Management Console.

## Files
| File | Description |
|------|-------------|
| `index.html` | Home page of the website |
| `error.html` | Error document shown for missing pages |
| `style.css` | Stylesheet |
| `bucket-policy.json` | Bucket policy allowing public read access |
| `screenshots/` | Screenshots of the AWS Console steps and the hosted website |

## Steps
1. Sign in to the AWS Management Console and open Amazon S3.
2. Create a bucket with a globally unique name in the chosen Region.
3. Upload `index.html`, `error.html`, and `style.css`.
4. Under **Properties**, enable **Static website hosting** and set `index.html` as the index document and `error.html` as the error document.
5. Under **Permissions**, turn off **Block all public access**.
6. Add `bucket-policy.json` as the bucket policy (replace `YOUR-BUCKET-NAME` with the bucket name).
7. Open the **bucket website endpoint** shown under Static website hosting to view the site.

## Result
The website is served directly from Amazon S3 without managing any server.

Website endpoint: `[paste your S3 website endpoint here]`

## Technologies
Amazon S3, AWS Management Console, HTML, CSS

## Reference
- AWS Documentation: Hosting a static website using Amazon S3 (docs.aws.amazon.com)
- AWS Training and Certification: AWS Cloud Practitioner Essentials
