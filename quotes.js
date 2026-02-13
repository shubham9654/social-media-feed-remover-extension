// Inspirational quotes database
export const quotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs"
  },
  {
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins"
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers"
  },
  {
    text: "You learn more from failure than from success.",
    author: "Unknown"
  },
  {
    text: "If you are working on something exciting that you really care about, you don't have to be pushed. The vision pulls you.",
    author: "Steve Jobs"
  },
  {
    text: "People who are crazy enough to think they can change the world, are the ones who do.",
    author: "Rob Siltanen"
  },
  {
    text: "We may encounter many defeats but we must not be defeated.",
    author: "Maya Angelou"
  },
  {
    text: "Knowing is not enough; we must apply. Wishing is not enough; we must do.",
    author: "Johann Wolfgang von Goethe"
  },
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "Go confidently in the direction of your dreams. Live the life you have imagined.",
    author: "Henry David Thoreau"
  },
  {
    text: "The two most important days in your life are the day you are born and the day you find out why.",
    author: "Mark Twain"
  },
  {
    text: "Whatever you can do, or dream you can, begin it. Boldness has genius, power and magic in it.",
    author: "Johann Wolfgang von Goethe"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb"
  },
  {
    text: "An unexamined life is not worth living.",
    author: "Socrates"
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Unknown"
  },
  {
    text: "Push yourself, because no one else is going to do it for you.",
    author: "Unknown"
  },
  {
    text: "Great things never come from comfort zones.",
    author: "Unknown"
  },
  {
    text: "Dream it. Wish it. Do it.",
    author: "Unknown"
  },
  {
    text: "Success doesn't just find you. You have to go out and get it.",
    author: "Unknown"
  },
  {
    text: "The harder you work for something, the greater you'll feel when you achieve it.",
    author: "Unknown"
  },
  {
    text: "Dream bigger. Do bigger.",
    author: "Unknown"
  },
  {
    text: "Don't stop when you're tired. Stop when you're done.",
    author: "Unknown"
  },
  {
    text: "Wake up with determination. Go to bed with satisfaction.",
    author: "Unknown"
  },
  {
    text: "Do something today that your future self will thank you for.",
    author: "Sean Patrick Flanery"
  },
  {
    text: "Little things make big things happen.",
    author: "John Wooden"
  },
  {
    text: "It's going to be hard, but hard does not mean impossible.",
    author: "Unknown"
  },
  {
    text: "Don't wait for opportunity. Create it.",
    author: "Unknown"
  },
  {
    text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
    author: "Unknown"
  },
  {
    text: "The key to success is to focus on goals, not obstacles.",
    author: "Unknown"
  },
  {
    text: "Dream it. Believe it. Build it.",
    author: "Unknown"
  }
];

/**
 * Get all quotes (default + custom)
 * @returns {Promise<Array>} Array of quote objects
 */
async function getAllQuotes() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['customQuotes'], (result) => {
        const customQuotes = result.customQuotes || [];
        resolve([...quotes, ...customQuotes]);
      });
    } else {
      resolve(quotes);
    }
  });
}

/**
 * Get a random quote from all available quotes (default + custom)
 * @returns {Promise<Object>} Quote object with text and author
 */
export async function getRandomQuote() {
  const allQuotes = await getAllQuotes();
  if (allQuotes.length === 0) {
    return { text: "Stay focused, stay productive.", author: "Unknown" };
  }
  const randomIndex = Math.floor(Math.random() * allQuotes.length);
  return allQuotes[randomIndex];
}

/**
 * Get a quote by index (useful for consistent display)
 * @param {number} index - Index of the quote
 * @returns {Object} Quote object with text and author
 */
export function getQuoteByIndex(index) {
  return quotes[index % quotes.length];
}
