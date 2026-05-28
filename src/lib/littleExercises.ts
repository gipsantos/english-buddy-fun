type Base = { id: number; topic: string; question: string; xpReward: number };
type Choice = Base & { options: string[]; correctAnswer: string };

export type LittleExercise =
  | (Choice & { type: "flashcard" })
  | (Choice & { type: "multiple_choice" })
  | (Choice & { type: "fill_blank" })
  | (Choice & { type: "listening"; audioScript: string })
  | {
      id: number;
      type: "speaking";
      topic: string;
      question: string;
      exampleAnswer: string;
      xpReward: number;
    }
  | {
      id: number;
      type: "matching";
      topic: string;
      question: string;
      pairs: Array<Record<string, string>>;
      xpReward: number;
    }
  | {
      id: number;
      type: "memory_game";
      topic: string;
      question: string;
      xpReward: number;
    }
  | {
      id: number;
      type: "celebration";
      topic: string;
      question: string;
      message: string;
      xpReward: number;
    };

export const littlePool = {
  ageGroup: "3 years old",
  level: "beginner",
  language: "English for preschool children",
  exercises: [
    { id: 1, type: "flashcard", topic: "colors", question: "What color is the apple? 🍎", options: ["Red", "Blue", "Green"], correctAnswer: "Red", xpReward: 5 },
    { id: 2, type: "matching", topic: "animals", question: "Match the animal to the sound", pairs: [{ animal: "Dog 🐶", sound: "Woof" }, { animal: "Cat 🐱", sound: "Meow" }], xpReward: 5 },
    { id: 3, type: "listening", topic: "greetings", audioScript: "Hello! How are you?", question: "What word did you hear?", options: ["Hello", "Banana", "Blue"], correctAnswer: "Hello", xpReward: 5 },
    { id: 4, type: "speaking", topic: "introductions", question: "Say: My name is...", exampleAnswer: "My name is Anna.", xpReward: 10 },
    { id: 5, type: "multiple_choice", topic: "numbers", question: "Which number is this? 3️⃣", options: ["Three", "Five", "One"], correctAnswer: "Three", xpReward: 5 },
    { id: 6, type: "flashcard", topic: "food", question: "What is this? 🍌", options: ["Banana", "Apple", "Orange"], correctAnswer: "Banana", xpReward: 5 },
    { id: 7, type: "memory_game", topic: "animals", question: "Find the matching animals 🐶🐶", xpReward: 10 },
    { id: 8, type: "fill_blank", topic: "colors", question: "The sun is ___ ☀️", options: ["Yellow", "Purple", "Black"], correctAnswer: "Yellow", xpReward: 5 },
    { id: 9, type: "listening", topic: "family", audioScript: "This is my mommy.", question: "Who is it?", options: ["Mommy", "Teacher", "Dog"], correctAnswer: "Mommy", xpReward: 5 },
    { id: 10, type: "multiple_choice", topic: "body", question: "Where are your eyes? 👀", options: ["Eyes", "Feet", "Hands"], correctAnswer: "Eyes", xpReward: 5 },
    { id: 11, type: "speaking", topic: "colors", question: "Say your favorite color", exampleAnswer: "Blue!", xpReward: 10 },
    { id: 12, type: "matching", topic: "toys", question: "Match the toy", pairs: [{ image: "🧸", word: "Teddy Bear" }, { image: "⚽", word: "Ball" }], xpReward: 5 },
    { id: 13, type: "multiple_choice", topic: "animals", question: "Which animal says meow? 🐱", options: ["Cat", "Dog", "Cow"], correctAnswer: "Cat", xpReward: 5 },
    { id: 14, type: "flashcard", topic: "transport", question: "What is this? 🚗", options: ["Car", "Plane", "Boat"], correctAnswer: "Car", xpReward: 5 },
    { id: 15, type: "listening", topic: "weather", audioScript: "It is sunny today.", question: "What is the weather?", options: ["Sunny", "Rainy", "Snowy"], correctAnswer: "Sunny", xpReward: 5 },
    { id: 16, type: "multiple_choice", topic: "shapes", question: "What shape is this? ⚪", options: ["Circle", "Square", "Triangle"], correctAnswer: "Circle", xpReward: 5 },
    { id: 17, type: "speaking", topic: "animals", question: "Can you say dog?", exampleAnswer: "Dog!", xpReward: 10 },
    { id: 18, type: "fill_blank", topic: "numbers", question: "One, two, ___", options: ["Three", "Five", "Seven"], correctAnswer: "Three", xpReward: 5 },
    { id: 19, type: "multiple_choice", topic: "food", question: "Which one is milk? 🥛", options: ["Milk", "Juice", "Soup"], correctAnswer: "Milk", xpReward: 5 },
    { id: 20, type: "flashcard", topic: "clothes", question: "What is this? 👕", options: ["T-shirt", "Hat", "Shoes"], correctAnswer: "T-shirt", xpReward: 5 },
    { id: 21, type: "multiple_choice", topic: "body", question: "What do you use to walk? 👣", options: ["Feet", "Eyes", "Hands"], correctAnswer: "Feet", xpReward: 5 },
    { id: 22, type: "listening", topic: "animals", audioScript: "The cow says moo.", question: "Which animal says moo?", options: ["Cow", "Dog", "Duck"], correctAnswer: "Cow", xpReward: 5 },
    { id: 23, type: "matching", topic: "colors", question: "Match the color", pairs: [{ emoji: "🍓", color: "Red" }, { emoji: "🌿", color: "Green" }], xpReward: 5 },
    { id: 24, type: "speaking", topic: "greetings", question: "Say: Hello!", exampleAnswer: "Hello!", xpReward: 10 },
    { id: 25, type: "multiple_choice", topic: "family", question: "Who is daddy? 👨", options: ["Daddy", "Baby", "Teacher"], correctAnswer: "Daddy", xpReward: 5 },
    { id: 26, type: "flashcard", topic: "animals", question: "What animal is this? 🦁", options: ["Lion", "Tiger", "Dog"], correctAnswer: "Lion", xpReward: 5 },
    { id: 27, type: "multiple_choice", topic: "weather", question: "What falls from the sky? 🌧️", options: ["Rain", "Shoes", "Milk"], correctAnswer: "Rain", xpReward: 5 },
    { id: 28, type: "fill_blank", topic: "colors", question: "Grass is ___ 🌱", options: ["Green", "Pink", "Black"], correctAnswer: "Green", xpReward: 5 },
    { id: 29, type: "listening", topic: "toys", audioScript: "I play with my ball.", question: "What toy did you hear?", options: ["Ball", "Car", "Doll"], correctAnswer: "Ball", xpReward: 5 },
    { id: 30, type: "memory_game", topic: "food", question: "Find the matching fruit 🍎🍎", xpReward: 10 },
    { id: 31, type: "flashcard", topic: "animals", question: "What is this? 🐘", options: ["Elephant", "Monkey", "Bear"], correctAnswer: "Elephant", xpReward: 5 },
    { id: 32, type: "multiple_choice", topic: "shapes", question: "What shape has 3 sides? 🔺", options: ["Triangle", "Circle", "Square"], correctAnswer: "Triangle", xpReward: 5 },
    { id: 33, type: "speaking", topic: "numbers", question: "Can you count to 3?", exampleAnswer: "One, two, three!", xpReward: 10 },
    { id: 34, type: "matching", topic: "transport", question: "Match the transport", pairs: [{ emoji: "✈️", word: "Plane" }, { emoji: "🚲", word: "Bike" }], xpReward: 5 },
    { id: 35, type: "multiple_choice", topic: "food", question: "Which one is an apple? 🍎", options: ["Apple", "Banana", "Carrot"], correctAnswer: "Apple", xpReward: 5 },
    { id: 36, type: "fill_blank", topic: "greetings", question: "___ morning!", options: ["Good", "Blue", "Cat"], correctAnswer: "Good", xpReward: 5 },
    { id: 37, type: "listening", topic: "body", audioScript: "Clap your hands!", question: "What should you clap?", options: ["Hands", "Feet", "Eyes"], correctAnswer: "Hands", xpReward: 5 },
    { id: 38, type: "flashcard", topic: "clothes", question: "What are these? 👟", options: ["Shoes", "Socks", "Hat"], correctAnswer: "Shoes", xpReward: 5 },
    { id: 39, type: "multiple_choice", topic: "animals", question: "Which animal can fly? 🐦", options: ["Bird", "Dog", "Fish"], correctAnswer: "Bird", xpReward: 5 },
    { id: 40, type: "speaking", topic: "family", question: "Say: I love my family!", exampleAnswer: "I love my family!", xpReward: 10 },
    { id: 41, type: "matching", topic: "body", question: "Match body parts", pairs: [{ emoji: "👃", word: "Nose" }, { emoji: "👂", word: "Ear" }], xpReward: 5 },
    { id: 42, type: "multiple_choice", topic: "colors", question: "What color is the sky? ☁️", options: ["Blue", "Orange", "Brown"], correctAnswer: "Blue", xpReward: 5 },
    { id: 43, type: "flashcard", topic: "food", question: "What drink is this? 🧃", options: ["Juice", "Water", "Tea"], correctAnswer: "Juice", xpReward: 5 },
    { id: 44, type: "listening", topic: "numbers", audioScript: "One little duck.", question: "What number did you hear?", options: ["One", "Four", "Ten"], correctAnswer: "One", xpReward: 5 },
    { id: 45, type: "fill_blank", topic: "animals", question: "The duck says ___", options: ["Quack", "Woof", "Moo"], correctAnswer: "Quack", xpReward: 5 },
    { id: 46, type: "multiple_choice", topic: "toys", question: "What toy is round? ⚽", options: ["Ball", "Book", "Pencil"], correctAnswer: "Ball", xpReward: 5 },
    { id: 47, type: "speaking", topic: "weather", question: "Say: It is sunny!", exampleAnswer: "It is sunny!", xpReward: 10 },
    { id: 48, type: "matching", topic: "food", question: "Match the fruit", pairs: [{ emoji: "🍓", word: "Strawberry" }, { emoji: "🍊", word: "Orange" }], xpReward: 5 },
    { id: 49, type: "multiple_choice", topic: "transport", question: "What flies in the sky? ✈️", options: ["Plane", "Bus", "Bike"], correctAnswer: "Plane", xpReward: 5 },
    { id: 50, type: "celebration", topic: "reward", question: "Amazing job! ⭐", message: "You finished 50 exercises!", xpReward: 50 },
  ] as LittleExercise[],
};