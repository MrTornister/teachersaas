# Zarządzanie Tier (Development)

## Zmiana Tier Ręcznie w Bazie Danych

Podczas developmentu możesz zmieniać tier nauczyciela ręcznie w bazie danych.

### 1. Znajdź swojego Teacher ID
Twoje Teacher ID to Clerk User ID. Możesz je znaleźć w:
- Dashboard Clerk
- Lub w konsoli przeglądarki po zalogowaniu (userId w Local Storage)

### 2. Aktualizuj tier w bazie

#### Przejdź na PRO:
```sql
UPDATE teachers 
SET plan_tier = 'pro' 
WHERE id = 'user_xxx...';
```

#### Wróć na Free:
```sql
UPDATE teachers 
SET plan_tier = 'free' 
WHERE id = 'user_xxx...';
```

### 3. Odśwież Dashboard
Po zmianie tier w bazie, odśwież Dashboard - powinieneś zobaczyć zmieniony badge.

## Efekty Zmiany Tier

### Free Tier
- Limit: **2 uczniów**
- Badge: "Free" (szary)

### PRO Tier
- Limit: **Nieograniczony**
- Badge: "PRO" (niebieski)

## Przyszła Integracja Stripe

W przyszłości dodamy:
- Przycisk "Upgrade to PRO" (płatność przez Stripe)
- Webhook do automatycznej zmiany tier po płatności
- Billing Portal (zarządzanie subskrypcją)

Na razie wszystko działa bez Stripe - tier zmieniasz ręcznie w bazie.
