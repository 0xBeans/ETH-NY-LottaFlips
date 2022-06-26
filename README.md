# Lotta Flips

Lottery Fractionalization.

In a recent blog post, the man himself, Vitalik Buterin goes over an interesting idea for degens - explanation is also paraphrased from Dave White.

Imagine Alice has an NFT worth 10 ETH and she has a high risk tolerance. Also imagine Bob who also has a high risk tolerance but has less than 10 eth, but is very interested in Alice's NFT. Alice can put her NFT up in a lottery that works like so:

Alice will sell Bob a lottery ticket for anywhere from 10% to 50% of the NFT value. Let's say he buys the ticket for 50% of the value, he would give her 5 ETH and she would give him a 50% chance to win the NFT by flipping a coin. If it came up heads, Alice would keep the NFT. If it came up tails, Bob would get the NFT - regardless, Alice gets 5 eth.

Similarly, if Bob only paid 1eth for the lottery ticket (10% of the value), they could roll a 10-sided die. If it came up 1, Bob would get the NFT, and if it came up 2 through 9, Alice would keep it (a 10% chance to win the 'lottery' for Bob).

This appeals to degens as this is completely and totally fair and the potential payout is quite high (instant profit for Alice while retaining her NFT or a potential to get a valuable NFT at a huge discount for Bob). The amount of ETH Bob pays is exactly equal to the expected value of the lottery ticket he receives. We realized... if people want lotteries and ponzis, give them lotteries and ponzis ;) 🤷‍♂️

# Tech

Built using foundry. Use `foundry install` to get started. We use a commit/reveal scheme for our randomness - more details in the code.

Goodnight. So much pain. Didnt have time to optimize gas or clean up code much T_T