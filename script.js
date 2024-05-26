

function generateDeck(excludeCards) {
    const ranks = '23456789TJQKA';
    const suits = 'CDHS';
    const deck = [];
    for (const rank of ranks) {
        for (const suit of suits) {
            const card = rank + suit;
            if (!excludeCards.includes(card)) {
                deck.push(card);
            }
        }
    }
    return deck;
}

function dealCards(deck, numPlayers) {
    const hands = [];
    for (let i = 0; i < numPlayers; i++) {
        const hand = [deck.pop(), deck.pop()];
        hands.push(hand);
    }
    return hands;
}

function evaluateHand(cards) {
    const ranks = '23456789TJQKA';
    const rankCount = {};
    const suitCount = {};
    for (const rank of ranks) {
        rankCount[rank] = 0;
    }
    for (const suit of 'CDHS') {
        suitCount[suit] = 0;
    }

    for (const card of cards) {
        rankCount[card[0]]++;
        suitCount[card[1]]++;
    }

    // Check for Four of a Kind
    if (Object.values(rankCount).includes(4)) {
        return "Four of a Kind";
    }

    // Check for Full House
    if (Object.values(rankCount).includes(3) && Object.values(rankCount).includes(2)) {
        return "Full House";
    }

    // Check for Flush
    if (Object.values(suitCount).some(count => count >= 5)) {
        return "Flush";
    }

    // Check for Straight
    const possibleStraights = [];
    for (let i = 0; i < ranks.length - 4; i++) {
        possibleStraights.push(ranks.slice(i, i + 5));
    }
    for (const straight of possibleStraights) {
        if (straight.split('').every(rank => rank in rankCount && rankCount[rank] > 0)) {
            return "Straight";
        }
    }

    // Check for Three of a Kind
    if (Object.values(rankCount).includes(3)) {
        return "Three of a Kind";
    }

    // Check for Two Pair
    const pairs = Object.values(rankCount).filter(count => count === 2).length;
    if (pairs >= 2) {
        return "Two Pair";
    }

    // Check for One Pair
    if (Object.values(rankCount).includes(2)) {
        return "One Pair";
    }

    return "High Card";
}

function compareHands(playerHand, opponentHand) {
    const handRankings = ["High Card", "One Pair", "Two Pair", "Three of a Kind", "Straight", "Flush", "Full House", "Four of a Kind"];
    const playerRank = handRankings.indexOf(playerHand);
    const opponentRank = handRankings.indexOf(opponentHand);
    if (playerRank > opponentRank) {
        return 1;
    } else if (playerRank < opponentRank) {
        return -1;
    } else {
        return 0;
    }
}

function simulateGame(playerCards, communityCards, numPlayers) {
    const excludeCards = [...playerCards, ...communityCards];
    const deck = generateDeck(excludeCards);
    const opponentHands = dealCards(deck, numPlayers);

    // Complete the community cards if necessary
    while (communityCards.length < 5) {
        communityCards.push(deck.pop());
    }

    const playerBestHand = evaluateHand([...playerCards, ...communityCards]);

    let playerWins = 0;
    let ties = 0;
    for (const opponent of opponentHands) {
        const opponentBestHand = evaluateHand([...opponent, ...communityCards]);
        const result = compareHands(playerBestHand, opponentBestHand);
        if (result === 1) {
            playerWins++;
        } else if (result === 0) {
            ties++;
        }
    }

    return [playerWins, ties];
}

function calculateDeckStrength(playerCards, communityCards, numPlayers, chips, simulations = 10000) {
    let totalWins = 0;
    let totalTies = 0;

    for (let i = 0; i < simulations; i++) {
        const [wins, ties] = simulateGame(playerCards, communityCards, numPlayers);
        totalWins += wins;
        totalTies += ties;
    }

    const winRate = (totalWins + totalTies / 2) / (simulations * numPlayers);

    let action = "Fold";
    let raiseAmount = 0;

    if (winRate > 0.7) {
        action = "Go All In";
        raiseAmount = chips;
    } else if (winRate > 0.5) {
        action = "Raise";
        raiseAmount = Math.min(chips, Math.floor(chips / 2));
    } else if (winRate > 0.3) {
        action = "Call";
    } else {
        action = "Fold";
    }

    return { winRate, action, raiseAmount };
}

// Example usage (for Node.js)
// const chips = 1000;
// const numPlayers = 4;
// const playerCards = ['2D', '3D'];
// const communityCards = ['4D', '5D', '6D'];
// const [winRate, action, raiseAmount] = calculateDeckStrength(playerCards, communityCards, numPlayers, chips);
// console.log(`Win Rate: ${winRate.toFixed(2)}`);
// console.log(`Action: ${action}`);
// console.log(`Raise Amount: ${raiseAmount}`);
