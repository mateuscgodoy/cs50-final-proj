# Trivia50

## Description

The goal from this project is to reproduce the famous "How wants to be a millionaire?" TV show, made possible by an awesome free online API called [Trivia](https://opentdb.com/).

## Game Mechanics

> **TLDR**: There will be 15 multiple choice questions on increasing difficulty, answer all of them correctly to win the highest amount of points. Answer a question wrong and the game is over.

The game starts with a "Setup" phase, where players will decide the following attributes:
* **Username**
	* Any name, with 2 or more characters, that suits you.
* **10 Trivia Categories**
	* There are a couple more than 10 categories in total, this will allow players to ban categories that they are not comfortable with.

The game consists in a series of **15 multiple choice questions**, each containing 4 possible choices, with only 1 of them being right.

Questions are bundled into 3 tiers. Each tier consists on a different difficulty, and also reward an increasing amount, more on that in the next section.

Tiers are minimally important, once a player completes all the questions from a tier, the minimum amount of points that they will get if they fail will be value awarded by the last question of the previous tier.

For example, if a player fails on question 11, since they completed the entire tier 1, they will receive 5.000 points. Same goes for a player that fails on question 13, receiving as a reward 25.000 points.

> The game goal is to answer all questions correctly, and the game ends if the player pick the wrong answer.

### Questions and Prizes

Following there's a table showing the rewarded amount of CSD, difficulty and tier for each question of the game:

| Question | Points    | Difficulty | Tier |
| -------- | --------- | ---------- | ---- |
| 1        | 500       | Easy       | 1    |
| 2        | 1.000     | Easy       | 1    |
| 3        | 2.000     | Easy       | 1    |
| 4        | 3.000     | Easy       | 1    |
| 5        | 5.000     | Easy       | 1    |
| 6        | 7.500     | Medium     | 2    |
| 7        | 10.000    | Medium     | 2    |
| 8        | 12.500    | Medium     | 2    |
| 9        | 15.000    | Medium     | 2    |
| 10       | 25.000    | Medium     | 2    |
| 11       | 50.000    | Hard       | 3    |
| 12       | 100.000   | Hard       | 3    |
| 13       | 250.000   | Hard       | 3    |
| 14       | 500.000   | Hard       | 3    |
| 15       | 1.000.000 | Hard       | 3    |


---