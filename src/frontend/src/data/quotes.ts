export const MOTIVATIONAL_QUOTES = [
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    quote:
      "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
  },
  {
    quote: "Imagination is more important than knowledge.",
    author: "Albert Einstein",
  },
  {
    quote: "The more that you read, the more things you will know.",
    author: "Dr. Seuss",
  },
  {
    quote: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
  {
    quote:
      "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  { quote: "If you can dream it, you can do it.", author: "Walt Disney" },
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    quote: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
  {
    quote:
      "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
  },
  {
    quote:
      "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
  },
  {
    quote: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    quote: "You have to expect things of yourself before you can do them.",
    author: "Michael Jordan",
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    quote:
      "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    quote: "If you can imagine it, you can achieve it.",
    author: "William Arthur Ward",
  },
  {
    quote:
      "Genius is one percent inspiration and ninety-nine percent perspiration.",
    author: "Thomas Edison",
  },
  {
    quote: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
  },
  {
    quote: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
  },
  { quote: "Try to be a rainbow in someone's cloud.", author: "Maya Angelou" },
  {
    quote:
      "I hated every minute of training, but I said, don't quit. Suffer now and live the rest of your life as a champion.",
    author: "Muhammad Ali",
  },
  {
    quote:
      "You don't have to see the whole staircase, just take the first step.",
    author: "Martin Luther King Jr.",
  },
  { quote: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
  {
    quote: "If opportunity doesn't knock, build a door.",
    author: "Milton Berle",
  },
  {
    quote:
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    quote: "In the middle of every difficulty lies opportunity.",
    author: "Albert Einstein",
  },
  {
    quote:
      "Challenges are what make life interesting. Overcoming them is what makes life meaningful.",
    author: "Joshua Marine",
  },
  {
    quote: "Whether you think you can or you think you can't, you're right.",
    author: "Henry Ford",
  },
  {
    quote: "Do something today that your future self will thank you for.",
    author: "Sean Patrick Flanery",
  },
  {
    quote: "The mind is not a vessel to be filled but a fire to be kindled.",
    author: "Plutarch",
  },
  {
    quote:
      "The more I read, the more I acquire, the more certain I am that I know nothing.",
    author: "Voltaire",
  },
  { quote: "Stay hungry. Stay foolish.", author: "Steve Jobs" },
  {
    quote:
      "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
  },
];

export function getDailyQuote(): { quote: string; author: string } {
  const seed = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}
