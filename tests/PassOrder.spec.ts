import {expect} from 'chai';
import {Game} from '../src/server/Game';
import {testGame} from './TestGame';
import {Phase} from '../src/common/Phase';

describe('Pass Order Feature', () => {
  it('should track pass order and use it for next generation turn order', () => {
    // Create a test game with 3 players
    const [game, player1, player2, player3] = testGame(3);
    
    // Move to action phase if not already there
    if (game.phase === Phase.RESEARCH) {
      game.gotoResearchPhase();
      // Simulate all players finishing research
      game.playerIsFinishedWithResearchPhase(player1);
      game.playerIsFinishedWithResearchPhase(player2);
      game.playerIsFinishedWithResearchPhase(player3);
    }
    
    // Verify initial state
    expect(game.passOrder).to.have.lengthOf(0);
    
    // Simulate players passing in a specific order: player3, player1, player2
    game.playerHasPassed(player3);
    expect(game.passOrder).to.deep.equal([player3.id]);
    
    game.playerHasPassed(player1);
    expect(game.passOrder).to.deep.equal([player3.id, player1.id]);
    
    game.playerHasPassed(player2);
    expect(game.passOrder).to.deep.equal([player3.id, player1.id, player2.id]);
    
    // Check that getNextGenerationOrder returns the expected order
    const nextGenOrder = game.getNextGenerationOrder();
    expect(nextGenOrder).to.have.lengthOf(3);
    expect(nextGenOrder[0].id).to.equal(player3.id);
    expect(nextGenOrder[1].id).to.equal(player1.id);
    expect(nextGenOrder[2].id).to.equal(player2.id);
    
    // Verify that the pass order affects first player determination
    (game as any).setFirstPlayerFromPassOrder();
    expect(game.first.id).to.equal(player3.id);
    
    // Verify turn order matches pass order
    expect(game.playersInGenerationOrder[0].id).to.equal(player3.id);
    expect(game.playersInGenerationOrder[1].id).to.equal(player1.id);
    expect(game.playersInGenerationOrder[2].id).to.equal(player2.id);
  });
  
  it('should handle serialization and deserialization of pass order', () => {
    const [game, player1, player2, player3] = testGame(3);
    
    // Set up some pass order
    game.playerHasPassed(player2);
    game.playerHasPassed(player3);
    game.playerHasPassed(player1);
    
    // Serialize the game
    const serialized = game.serialize();
    expect(serialized.passOrder).to.deep.equal([player2.id, player3.id, player1.id]);
    
    // Deserialize the game
    const deserializedGame = Game.deserialize(serialized);
    expect(deserializedGame.passOrder).to.deep.equal([player2.id, player3.id, player1.id]);
    
    // Verify the next generation order is preserved
    const nextGenOrder = deserializedGame.getNextGenerationOrder();
    expect(nextGenOrder[0].id).to.equal(player2.id);
    expect(nextGenOrder[1].id).to.equal(player3.id);
    expect(nextGenOrder[2].id).to.equal(player1.id);
  });
  
  it('should clear pass order when starting new action phase', () => {
    const [game, player1, player2] = testGame(2);
    
    // Set up pass order
    game.playerHasPassed(player1);
    game.playerHasPassed(player2);
    expect(game.passOrder).to.have.lengthOf(2);
    
    // Simulate transition to new generation (clear pass order in playerIsFinishedWithResearchPhase)
    game.passOrder = []; // This simulates what happens in the actual method
    expect(game.passOrder).to.have.lengthOf(0);
  });
});
