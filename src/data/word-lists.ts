export const categories = {
  animals: ['DOG', 'CAT', 'LION', 'TIGER', 'BEAR', 'ELEPHANT', 'GIRAFFE', 'ZEBRA', 'MONKEY', 'KANGAROO', 'PANDA', 'WOLF'],
  food: ['PIZZA', 'BURGER', 'PASTA', 'SALAD', 'SUSHI', 'STEAK', 'TACO', 'BREAD', 'CHEESE', 'APPLE', 'ORANGE', 'GRAPES'],
  sports: ['SOCCER', 'BASKETBALL', 'TENNIS', 'BASEBALL', 'GOLF', 'SWIMMING', 'VOLLEYBALL', 'HOCKEY', 'RUGBY', 'CRICKET', 'BOXING', 'SKIING'],
  space: ['PLANET', 'STAR', 'GALAXY', 'COMET', 'ASTEROID', 'NEBULA', 'COSMOS', 'ORBIT', 'ROCKET', 'ALIEN', 'SUN', 'MOON'],
};

export type Category = keyof typeof categories;

export const difficulties = {
    easy: { size: 8, words: 6 },
    medium: { size: 12, words: 10 },
    hard: { size: 15, words: 12 },
};

export type Difficulty = keyof typeof difficulties;