# GeoIP Database Setup

Ce dossier contient la base de données GeoLite2 pour la localisation géographique des adresses IP.

## Installation

1. Téléchargez la base de données GeoLite2 City depuis le site de MaxMind:
   - Allez sur https://dev.maxmind.com/geoip/geolite2-free-geolocation-data
   - Créez un compte gratuit
   - Téléchargez le fichier `GeoLite2-City.mmdb`

2. Placez le fichier `GeoLite2-City.mmdb` dans ce dossier:
   ```
   backend/main/geoip/GeoLite2-City.mmdb
   ```

## Utilisation

La base de données est utilisée par le middleware `UserTrackingMiddleware` pour obtenir la localisation géographique des utilisateurs à partir de leur adresse IP.

## Mise à jour

La base de données GeoLite2 est mise à jour chaque semaine par MaxMind. Il est recommandé de la mettre à jour régulièrement pour maintenir la précision de la localisation.

## Alternative

Si vous ne souhaitez pas utiliser GeoIP2, vous pouvez utiliser une API de géolocalisation en ligne comme:
- ipinfo.io
- ip-api.com
- ipstack.com

Vous devrez alors modifier la fonction `get_geolocation` dans `middleware.py` pour utiliser l'API de votre choix.
