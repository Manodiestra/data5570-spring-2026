# Generated manually for Cognito-linked profiles

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("auctions", "0002_cognito_sub_fields"),
    ]

    operations = [
        migrations.CreateModel(
            name="UserProfile",
            fields=[
                (
                    "cognito_sub",
                    models.CharField(max_length=128, primary_key=True, serialize=False),
                ),
                ("display_name", models.CharField(blank=True, max_length=150)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "user profile",
                "verbose_name_plural": "user profiles",
            },
        ),
    ]
