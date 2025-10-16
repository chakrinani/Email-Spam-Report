# 📧 Email Spam Report

Email Spam Report is a web app that helps you test and analyze your email deliverability across multiple inbox providers.  
It generates a unique **Test Code** for each test, allowing you to track whether your emails land in the inbox, promotions, or spam folders.

---

## 🚀 Features

- 🔑 **Auto-generated Test Code** — Unique identifier for each test.
- 📬 **Multiple Inbox Testing** — Check email placement across 5+ test inboxes.
- 🧠 **Smart Analysis** — Detects where your email lands (Inbox / Promotions / Spam).
- 📊 **Detailed Report** — See deliverability score and overall email health.
- ☁️ **Supabase Integration** — Secure backend with serverless functions.
- 🎨 **Modern UI** — Built using React, Vite, TailwindCSS, and Shadcn UI.

---

## 🖥️ Tech Stack

| Category | Technologies |
|-----------|--------------|
| Frontend | React + TypeScript + Vite |
| Styling | TailwindCSS + Shadcn UI |
| Icons | Lucide-React |
| Notifications | Sonner Toasts |
| Backend | Supabase (Edge Functions + PostgreSQL) |

---

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chakrinani/Email-Spam-Report.git
   cd Email-Spam-Report
````

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. Open your browser at
   👉 [http://localhost:5173](http://localhost:5173)

---

## 🧩 Folder Structure

```
Email-Spam-Report/
 ├── src/
 │   ├── components/      # Reusable UI Components
 │   ├── pages/           # Main App Pages
 │   ├── integrations/    # Supabase and other services
 │   └── App.tsx          # Root Component
 ├── public/              # Static Assets
 ├── package.json
 └── README.md
```

---

## 🧠 How It Works

1. **Generate a Test Code** — The app provides a unique code each time.
2. **Send an Email** — Include that code in your email subject or body.
3. **Wait a Few Minutes** — The system analyzes where your email lands.
4. **View Report** — Check detailed inbox placement results and score.

---

## 🛠️ Commands

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Run development server       |
| `npm run build`   | Build project for production |
| `npm run preview` | Preview production build     |
| `npm run lint`    | Lint code using ESLint       |

---

## 📸 Screenshots

| Test Code Card                                                        | How It Works Section                                                        |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| ![Test Code](https://via.placeholder.com/400x200?text=Test+Code+Card) | ![How It Works](https://via.placeholder.com/400x200?text=Instructions+Card) |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open a pull request or report bugs in the [issues](../../issues) section.

---

## 🧾 License

This project is licensed under the **MIT License**.
You’re free to use, modify, and distribute it for both personal and commercial purposes.

---

### 👨‍💻 Developed by [Chakravarthi Nani](https://github.com/chakrinani)

