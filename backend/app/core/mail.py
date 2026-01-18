import boto3
from .config import settings


def send_confirmation_email(to_address: str, confirmation_link: str):
    ses = boto3.client(
        "ses",
        region_name=settings.REGION_NAME,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )
    ses.send_email(
        Source=settings.DOMAIN_MAIL,
        Destination={
            "ToAddresses": [to_address]
        },
        Message={
            "Subject": {
                "Data": "Witamy w Ankietio - Potwierdź swój adres email",
                "Charset": "UTF-8"
            },
            "Body": {
                "Text": {
                    "Data": "Aby potwierdzić swój adres email, kliknij w poniższy link:\n\n" + confirmation_link,
                    "Charset": "UTF-8"
                }
            }
        }
    )


def send_password_reset_email(to_address: str, reset_link: str):
    ses = boto3.client(
        "ses",
        region_name=settings.REGION_NAME,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )
    ses.send_email(
        Source=settings.DOMAIN_MAIL,
        Destination={
            "ToAddresses": [to_address]
        },
        Message={
            "Subject": {
                "Data": "Ankietio - Prośba o zresetowanie hasła",
                "Charset": "UTF-8"
            },
            "Body": {
                "Text": {
                    "Data": "Aby zresetować hasło, kliknij w poniższy link:\n\n" + reset_link,
                    "Charset": "UTF-8"
                }
            }
        }
    )
