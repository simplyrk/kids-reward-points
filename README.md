# 🌟 Kids Reward Points (KRP) App

> **Transform chores into adventures!** A fun, interactive reward system that motivates kids to complete tasks while teaching them valuable life skills.

## 🚀 One-Click Deploy

**First, fork this repository** by clicking the Fork button at the top right of this page. Then, from your forked repo:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/rama/krp-app)

## ✨ What is KRP?

KRP is a modern web application that gamifies household tasks and responsibilities for children. Parents can award points for completed tasks, and kids can track their progress with a fun, kid-friendly interface!

### 🎯 Key Features

- **👨‍👩‍👧‍👦 Family Management** - Parents can create and manage multiple child accounts
- **🏆 Point System** - Award points for completed tasks and good behavior
- **📱 Mobile-First Design** - Works perfectly on phones, tablets, and computers
- **🔒 Secure Authentication** - Safe login system for both parents and kids
- **🎨 Kid-Friendly UI** - Colorful, engaging interface that kids love
- **📊 Progress Tracking** - Visual dashboards to see achievements

## 🚀 Deploy in 3 Minutes!

### Step 1: Fork This Repository
Click the **Fork** button at the top right of this page to create your own copy of this project.

### Step 2: Create a Neon Database (Free!)

1. Go to [Neon.tech](https://neon.tech) and click **"Sign Up"** (it's free!)
2. Once logged in, click **"Create a project"**
3. Give your project a name (like "krp-database")
4. Select a region close to you
5. Click **"Create project"**
6. **Important!** Copy your connection string - it looks like this:
   ```
   postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
7. Keep this page open - you'll need this connection string in Step 2!

### Step 3: Deploy to Vercel

1. In your forked repository, click the **"Deploy with Vercel"** button at the top of this README
2. Sign in to Vercel (or create a free account)
3. Vercel will automatically import your forked repository
4. When asked for environment variables, paste your Neon connection string:
   - **DATABASE_URL**: Paste your connection string here
   - **DATABASE_URL_UNPOOLED**: Paste the same connection string here
   - **NEXTAUTH_URL**: Leave empty for now (Vercel will set this automatically)
   - **NEXTAUTH_SECRET**: Click "Generate" or create your own secret password
5. Click **"Deploy"**
6. Wait 2-3 minutes for the deployment to complete
7. Click **"Visit"** to see your live app! 🎉

### Step 4: Set Up Your Database

After deployment, you need to initialize your database:

1. In Vercel, go to your project settings
2. Click on the **"Functions"** tab
3. Find the URL of your deployment (like `https://your-app.vercel.app`)
4. Open a new terminal on your computer
5. Run this command (replace with your URL):
   ```bash
   curl https://your-app.vercel.app/api/setup
   ```
6. Your database is now ready to use!

## 🛠️ Environment Variables

Here's what each environment variable does:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `DATABASE_URL_UNPOOLED` | Same as DATABASE_URL (required by Neon) | Same as above |
| `NEXTAUTH_URL` | Your app's URL (Vercel sets this automatically) | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Secret key for authentication (keep this safe!) | Any random string |

## 💻 Local Development

Want to run it on your computer? Here's how:

```bash
# Clone your forked repository
git clone https://github.com/YOUR_GITHUB_USERNAME/krp-app.git
cd krp-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your Neon database URL to .env.local
# DATABASE_URL="your-neon-connection-string"
# DATABASE_URL_UNPOOLED="your-neon-connection-string"
# NEXTAUTH_SECRET="your-secret-key"

# Set up the database
npx prisma generate
npx prisma db push

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## 📱 How to Use KRP

### For Parents:
1. Create your parent account
2. Add your kids as users
3. Award points for completed tasks
4. Track progress and achievements

### For Kids:
1. Log in with your username (parents will give this to you)
2. Check your points balance
3. See what tasks you can do to earn more points
4. Watch your points grow!

## 🏗️ Built With

- **[Next.js 15](https://nextjs.org/)** - The React framework for production
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM for Node.js
- **[Neon](https://neon.tech/)** - Serverless PostgreSQL database
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication for Next.js
- **[Tailwind CSS](https://tailwindcss.com/)** - For beautiful, responsive design
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component library

## 🤝 Contributing

We love contributions! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is open source and available under the [MIT-0 License](LICENSE).

---

<p align="center">Made with ❤️ for families everywhere</p>