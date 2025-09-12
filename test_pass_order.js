// Simple test to verify pass order functionality
const { Game } = require('./build/src/server/Game.js');
const { TestGame } = require('./build/tests/TestGame.js');
const { Phase } = require('./build/src/common/Phase.js');

console.log('Testing pass order functionality...');

try {
  // Create a test game with 3 players
  const [game, player1, player2, player3] = TestGame.testGame(3);
  
  console.log('Initial game state:');
  console.log('Generation:', game.generation);
  console.log('Phase:', game.phase);
  console.log('First player:', game.first.name);
  console.log('Players in generation order:', game.playersInGenerationOrder.map(p => p.name));
  console.log('Pass order:', game.passOrder);
  console.log('Next generation order:', game.getNextGenerationOrder().map(p => p.name));
  
  // Simulate players passing in a different order than the turn order
  if (game.phase === Phase.ACTION) {
    console.log('\nSimulating pass order: player3, player1, player2');
    
    // Player 3 passes first
    game.playerHasPassed(player3);
    console.log('After player3 passes:', game.passOrder, game.getNextGenerationOrder().map(p => p.name));
    
    // Player 1 passes second  
    game.playerHasPassed(player1);
    console.log('After player1 passes:', game.passOrder, game.getNextGenerationOrder().map(p => p.name));
    
    // Player 2 passes last
    game.playerHasPassed(player2);
    console.log('After player2 passes:', game.passOrder, game.getNextGenerationOrder().map(p => p.name));
    
    console.log('\nFinal pass order:', game.passOrder);
    console.log('Expected next generation order:', game.getNextGenerationOrder().map(p => p.name));
    
    // Verify that the next generation order matches the pass order
    const nextGenOrder = game.getNextGenerationOrder();
    const expectedOrder = [player3.name, player1.name, player2.name];
    const actualOrder = nextGenOrder.map(p => p.name);
    
    if (JSON.stringify(actualOrder) === JSON.stringify(expectedOrder)) {
      console.log('✅ Pass order test PASSED!');
    } else {
      console.log('❌ Pass order test FAILED!');
      console.log('Expected:', expectedOrder);
      console.log('Actual:', actualOrder);
    }
  } else {
    console.log('Game is not in ACTION phase, skipping pass order test');
  }
  
} catch (error) {
  console.error('Error during test:', error);
  console.error(error.stack);
}

console.log('Test completed.');
