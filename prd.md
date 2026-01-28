# PRODUCT REQUIREMENTS DOCUMENT (PRD) v3.1

**Project Name**: Teacher’s Context Tool (MVP)  
**Version**: 3.1 (Full Spec: Core + i18n + Monetization)  
**Status**: Ready for Development

---

## 1. Wstęp i Filozofia Produktu

### 1.1 Problem
Lektorzy językowi i korepetytorzy pracujący w trybie 1:1 toną w notatkach. Tradycyjne CRM-y są zbyt skomplikowane, a zwykłe notatniki (Google Docs/Papier) nie dają struktury. Nauczyciel przed lekcją traci czas na przypominanie sobie "co robiliśmy ostatnio", a po lekcji nie ma czasu na uporządkowanie materiału.

### 1.2 Rozwiązanie (Value Proposition)
Aplikacja typu "Flow-Centric Tool".
- **Snapshot over History**: Pokazujemy tylko to, co aktualne. Ukrywamy historię, by nie przytłaczać.
- **Keyboard-First Capture**: W trakcie lekcji nauczyciel nie odrywa rąk od klawiatury (slash commands).
- **Asynchroniczna Synteza**: Wymuszamy porządek (Summary), ale nie blokujemy pracy bieżącej (obsługa lekcji jedna po drugiej).
- **Global-Ready**: Aplikacja od pierwszej linii kodu wspiera wielojęzyczność (i18n).

---

## 2. Szczegółowy Zakres Funkcjonalny (Functional Scope)

### 2.1 Moduł: Zarządzanie Uczniami (Student Management)
**Lista Uczniów (Dashboard):**
- Widok kafelkowy lub lista.
- **Statusy wizualne**:
    - 🟢 **Ready**: Brak zaległości, można startować lekcję.
    - 🟠 **Pending Summary**: Lekcja zakończona, ale niepodsumowana.
- **Sortowanie**: Ostatnio aktywni na górze.

**CRUD Ucznia:**
- **Pola**: Imię (wymagane), Język docelowy (opcjonalne), Notatka prywatna.
- **Akcje**: Dodaj, Edytuj, Archiwizuj (Soft Delete), Przywróć.
- **Limit**: Walidacja limitu darmowego planu przy próbie dodania/przywrócenia.
- **i18n Context**: Nazwy pól w formularzach pobierane z plików tłumaczeń (`t('student.name')`).

### 2.2 Moduł: Lesson Mode (Tryb Lekcji - Core Feature)
To serce aplikacji. Musi działać najszybciej.
- **Interfejs**: Minimalistyczny. Na górze "Snapshot" (stan ucznia), na dole "Input Stream".

**Input Bar (Wiersz poleceń):**
- Pole tekstowe zawsze aktywne (autofocus).
- Obsługa Slash Commands (konfigurowalnych lub sztywnych w MVP, zmapowanych na języki):
    - `/hw` (Homework) → Oznacza wpis jako Zadanie Domowe.
    - `/err` (Error/Focus) → Oznacza jako Błąd/Do poprawy.
    - `/in` (Insight) → Oznacza jako Notatkę/Postęp.
    - Brak komendy → Traktowane jako "Notatka ogólna".

**Optimistic UI (Kluczowe wymaganie):**
- Po naciśnięciu Enter:
    - Wpis natychmiast pojawia się na liście powyżej.
    - W tle leci Server Action do bazy.
    - Jeśli zapis się nie uda, wpis oznaczany jest błędem z opcją "Ponów".

**Zakończenie lekcji:**
- Przycisk "Stop Lesson".
- Akcja: Zmienia status sesji na `PENDING_SUMMARY` i przekierowuje na Dashboard.

### 2.3 Moduł: Post-Lesson Summary (Synteza)
Ekran, który porządkuje chaos.
- **Dostęp**: Wymuszony przy próbie rozpoczęcia kolejnej lekcji z tym samym uczniem. Dostępny dobrowolnie z Dashboardu.

**Workflow:**
- **Po lewej**: Lista surowych wpisów z lekcji (Raw Entries).
- **Po prawej**: Sekcje Docelowe (Snapshot):
    - Focus Areas (Limit: max 3 aktywne).
    - Active Goal (Limit: 1 główny cel).
    - Homework (Limit: 1 zadanie na teraz).
    - Backlog (Bez limitu - "Parking Lot" na pomysły).
- **Drag & Drop**: Przypisywanie wpisów do sekcji.
- **Zatwierdzenie (Commit)**:
    - Tworzy nową wersję `StudentCard` w bazie.
    - Zdejmuje flagę `PENDING_SUMMARY`.

### 2.4 Moduł: Student Card (Snapshot) & Student View
- **Student Card (Nauczyciel)**: Widok "Read-only" pokazujący aktualny stan. Brak widocznej historii zmian.
- **Student View (Uczeń)**:
    - Publiczny, unikalny URL (tokenizowany).
    - **Wielojęzyczność dla ucznia**: Aplikacja wykrywa język przeglądarki ucznia i wyświetla interfejs w jego języku, niezależnie od ustawień nauczyciela.
    - **Zawartość**: Active Goal, Homework (z opcją "Mark as Done"), Focus Areas.

---

## 3. Architektura Techniczna (Vercel Ecosystem)
Aplikacja zaprojektowana jako Monolit (Modular Monolith) na Next.js App Router.

### 3.1 Stack Technologiczny
- **Frontend & Backend**: Next.js 14+ (App Router, Server Actions).
- **Język**: TypeScript.
- **Styling**: Tailwind CSS + shadcn/ui.
- **Internationalization (i18n)**: next-intl.
    - Middleware do detekcji locale (`/pl`, `/en`).
- **Database**: Vercel Postgres (Neon).
- **ORM**: Drizzle ORM (Lekki, type-safe).
- **Auth**: Clerk (User Management).
- **Płatności**: Stripe (Checkout & Webhooks).

### 3.2 Model Danych (Schema Design - Drizzle)
```typescript
// users (Teachers) - zarządzane przez Clerk + lokalna metadata
table teachers {
  id: text (clerk_id) PK
  email: text
  interface_language: varchar(5) default 'en'
  created_at: timestamp
  
  // Pola Monetyzacji
  stripe_customer_id: text (unique index)
  stripe_subscription_id: text
  subscription_status: enum('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'none') default 'none'
  plan_tier: enum('free', 'pro') default 'free'
  role: enum('user', 'admin') default 'user'
}

// students
table students {
  id: uuid PK
  teacher_id: text FK(teachers.id)
  name: text
  access_token: uuid (unique index) // do Student View
  status: enum('active', 'archived')
  preferred_view_language: varchar(5) // język UI ucznia
}

// sessions (Lekcje)
table sessions {
  id: uuid PK
  student_id: uuid FK(students.id)
  started_at: timestamp
  ended_at: timestamp
  status: enum('in_progress', 'pending_summary', 'closed')
}

// raw_entries (Wpisy z lekcji)
table raw_entries {
  id: uuid PK
  session_id: uuid FK(sessions.id)
  content: text
  type: enum('note', 'homework', 'error', 'insight')
  created_at: timestamp
  is_processed: boolean
}

// student_cards (Snapshoty)
table student_cards {
  id: uuid PK
  student_id: uuid FK(students.id)
  version: int
  data: jsonb // {active_goal, focus_areas, homework, backlog}
  created_at: timestamp
}
```

### 3.3 Strategia i18n
- **Pliki**: `/messages/en.json`, `/messages/pl.json`.
- **Routing**: Sub-path (`app.com/pl/dashboard`).
- **Komponenty**: Server Components (`getTranslations`), Client Components (`useTranslations`).

---

## 4. Wymagania Niefunkcjonalne
- **Wydajność**: Input w Lesson Mode < 50ms (Optimistic UI).
- **Bezpieczeństwo**:
    - Rygorystyczna walidacja `teacher_id` przy każdym zapytaniu do bazy.
    - Tokeny studentów (UUID) niesekwencyjne.
- **Dostępność**: Obsługa klawiaturą (Keyboard-first).
- **Skalowalność**: Serverless (Vercel Functions + Neon DB).

---

## 5. User Flows (Scenariusze Użycia)

### Scenariusz A: Lekcja "Back-to-Back"
1. **17:00**: Start lekcji z Uczniem A. Szybkie notatki.
2. **17:59**: Koniec lekcji. Brak czasu na podsumowanie.
3. **18:00**: Start lekcji z Uczniem B (System zezwala, mimo że Uczeń A jest "Pending Summary").
4. **19:00**: Nauczyciel wraca do Ucznia A, robi Summary, aktualizuje kartę.

### Scenariusz B: Student View (Wielojęzyczny)
1. Nauczyciel (UI: Polski) wysyła link uczniowi (UI: Hiszpański).
2. Uczeń otwiera link.
3. System wykrywa locale `es` i serwuje hiszpański interfejs.
4. Treść zadań (content) pozostaje w języku wpisanym przez nauczyciela.

---

## 6. Roadmapa Wdrożenia
- **Faza 1 (Setup)**: Repo, Next.js, Clerk, Drizzle, i18n setup.
- **Faza 2 (Core)**: Dashboard, Lesson Mode, Optimistic UI.
- **Faza 3 (Logic)**: Summary, Student Card Snapshot, Back-to-back logic.
- **Faza 4 (Monetization)**: Integracja Stripe, limit 2 uczniów, Admin Panel.
- **Faza 5 (Launch)**: Student View, Deploy na Vercel Production.

---

## 7. Model Biznesowy i Panel Administracyjny (Monetization & Admin)
Celem tego modułu jest przekształcenie narzędzia w dochodowy Micro-SaaS oraz zapewnienie właścicielowi kontroli.

### 7.1 Model Monetyzacji (Freemium)
**Plan FREE:**
- **Limit**: Do 2 aktywnych uczniów (Active Students).
- Uczniowie zarchiwizowani nie wliczają się do limitu.
- Pełna funkcjonalność aplikacji (w tym i18n, Student View).

**Plan PRO (Subskrypcja):**
- **Cena**: X PLN/USD miesięcznie.
- **Limit**: Nielimitowana liczba uczniów.
- Priorytetowy support (opcjonalnie).

### 7.2 Integracja ze Stripe
- **Bramka płatności**: Stripe Checkout.
- **Zarządzanie**: Stripe Customer Portal (faktury, zmiana karty).
- **Mechanizm Paywall**:
    - Sprawdzenie limitu następuje przy akcji: **Dodaj ucznia** lub **Przywróć z archiwum**.
    - **Warunek blokady**: Jeśli `active_students >= 2` ORAZ `plan_tier == 'free'`, wyświetl Modal Premium.

### 7.3 Super Admin Panel (Dla Właściciela)
Dostępny pod `/admin`, zabezpieczony rolą `admin` w tabeli `teachers`.

**Dashboard (KPIs):**
- MRR (Przychód miesięczny).
- Liczba użytkowników Free vs Pro.

**Zarządzanie Nauczycielami:**
- Lista wszystkich zarejestrowanych.
- **Akcje**:
    - **Grant Pro**: Ręczne nadanie statusu PRO (np. dla beta testerów) z pominięciem płatności.
    - **Ban**: Blokada dostępu.

### 7.4 Techniczna Implementacja Płatności (Webhooks)
Aplikacja nasłuchuje endpoint `/api/webhooks/stripe`.
- Zdarzenie `checkout.session.completed` → Update `teachers` table (`plan_tier = 'pro'`, `subscription_status = 'active'`).
- Zdarzenie `customer.subscription.deleted` → Update `teachers` table (`plan_tier = 'free'`).
- **Uwaga**: Jeśli użytkownik anuluje subskrypcję mając 10 uczniów, nie usuwamy ich. Traci on tylko możliwość dodawania nowych, dopóki nie zejdzie poniżej limitu (2).

### 7.5 Scenariusz Płatności (User Flow)
1. Nauczyciel (Plan Free) ma 2 uczniów.
2. Klika "Dodaj ucznia".
3. System wyświetla: "Osiągnięto limit. Przejdź na PRO".
4. Kliknięcie "Upgrade" → Stripe Checkout.
5. Płatność OK → Powrót do aplikacji.
6. Limit zdjęty natychmiastowo (dzięki Webhookom).