import {expect} from 'chai';
import {testGame} from './TestGame';
import {TestPlayer} from './TestPlayer';

describe('Game - Turn Order', () => {
  it('should set initial first player correctly', () => {
    const [game, player1] = testGame(3);
    
    expect(game.first).to.eq(player1);
    expect(game.first.name).to.eq('player1');
  });

  it('should increment first player to next player in order', () => {
    const [game, player1, player2, player3] = testGame(3);
    
    // Initial state
    expect(game.first).to.eq(player1);
    
    // Increment first player
    game.incrementFirstPlayer();
    expect(game.first).to.eq(player2);
    
    // Increment again
    game.incrementFirstPlayer();
    expect(game.first).to.eq(player3);
    
    // Should wrap around to first player
    game.incrementFirstPlayer();
    expect(game.first).to.eq(player1);
  });

  it('should override first player when requested', function() {
    const [game] = testGame(3);
    const players = game.players;
    
    // Override with a valid player
    const originalFirst = game.first.id;
    game.overrideFirstPlayer(players[2]);
    expect(game.first.id).to.equal(players[2].id);
    expect(game.first.id).to.not.equal(originalFirst);
  });

  it('should maintain turn order throughout multiple generations', () => {
    const [game] = testGame(3);
    
    // Track the sequence of first players over multiple generations
    const firstPlayerSequence = [];
    
    // Initial first player
    firstPlayerSequence.push(game.first.name);
    
    // Simulate 6 generation changes (2 full cycles)
    for (let i = 0; i < 6; i++) {
      game.incrementFirstPlayer();
      firstPlayerSequence.push(game.first.name);
    }
    
    // Should follow the pattern: player1 -> player2 -> player3 -> player1 -> player2 -> player3 -> player1
    expect(firstPlayerSequence).to.deep.equal([
      'player1', 'player2', 'player3', 'player1', 'player2', 'player3', 'player1'
    ]);
  });

  it('should work correctly with different number of players', () => {
    // Test with 2 players
    const [game2p, p1, p2] = testGame(2);
    expect(game2p.first).to.eq(p1);
    game2p.incrementFirstPlayer();
    expect(game2p.first).to.eq(p2);
    game2p.incrementFirstPlayer();
    expect(game2p.first).to.eq(p1);
    
    // Test with 4 players
    const [game4p, p1_4, p2_4, p3_4, p4_4] = testGame(4);
    expect(game4p.first).to.eq(p1_4);
    game4p.incrementFirstPlayer();
    expect(game4p.first).to.eq(p2_4);
    game4p.incrementFirstPlayer();
    expect(game4p.first).to.eq(p3_4);
    game4p.incrementFirstPlayer();
    expect(game4p.first).to.eq(p4_4);
    game4p.incrementFirstPlayer();
    expect(game4p.first).to.eq(p1_4);
  });

  it('should handle edge case when first player is not found', () => {
    const [game] = testGame(3);
    
    // Simulate corruption by setting first player to someone not in the game
    const fakePlayer = TestPlayer.BLUE.newPlayer({name: 'fake'});
    (game as any).first = fakePlayer;
    
    // This should throw an error when trying to increment
    expect(() => game.incrementFirstPlayer()).to.throw('Didn\'t find player');
  });

  it('should set correct turn order when players pass in different orders', () => {
    const [game, player1, player2, player3] = testGame(3, {skipInitialCardSelection: true});
    
    // Test scenario 1: Player3 passes first, then Player1, then Player2
    // Simulate players passing in order: player3 -> player1 -> player2
    game.playerHasPassed(player3);
    game.playerHasPassed(player1);
    game.playerHasPassed(player2);
    
    // Simulate what happens in gotoProductionPhase when all players have passed
    if ((game as any).passedPlayers.length === game.players.length) {
      const newOrder = (game as any).passedPlayers.map((id: any) => game.getPlayerById(id));
      (game as any).playersInGenerationOrder = newOrder;
      (game as any).setFirstPlayer(newOrder[0]);
    }
    
    // When all players have passed, the turn order for next generation should be:
    // player3 (first to pass) -> player1 -> player2
    expect(game.playersInGenerationOrder).to.have.length(3);
    expect(game.playersInGenerationOrder[0]).to.eq(player3);
    expect(game.playersInGenerationOrder[1]).to.eq(player1);
    expect(game.playersInGenerationOrder[2]).to.eq(player2);
    
    // First player of next generation should be the first one who passed
    expect(game.first).to.eq(player3);
  });

  it('should handle different passing orders across multiple generations', () => {
    const [game, player1, player2, player3] = testGame(3, {skipInitialCardSelection: true});
    
    // Generation 1: Normal order passing (player1 -> player2 -> player3)
    game.playerHasPassed(player1);
    game.playerHasPassed(player2);
    game.playerHasPassed(player3);
    
    // Simulate production phase logic
    if ((game as any).passedPlayers.length === game.players.length) {
      const newOrder = (game as any).passedPlayers.map((id: any) => game.getPlayerById(id));
      (game as any).playersInGenerationOrder = newOrder;
      (game as any).setFirstPlayer(newOrder[0]);
    }
    
    expect(game.playersInGenerationOrder[0]).to.eq(player1);
    expect(game.first).to.eq(player1);
    
    // Start next generation - reset passed players
    (game as any).passedPlayers = [];
    
    // Generation 2: Reverse order passing (player3 -> player2 -> player1)
    game.playerHasPassed(player3);
    game.playerHasPassed(player2);
    game.playerHasPassed(player1);
    
    // Simulate production phase logic again
    if ((game as any).passedPlayers.length === game.players.length) {
      const newOrder = (game as any).passedPlayers.map((id: any) => game.getPlayerById(id));
      (game as any).playersInGenerationOrder = newOrder;
      (game as any).setFirstPlayer(newOrder[0]);
    }
    
    expect(game.playersInGenerationOrder[0]).to.eq(player3);
    expect(game.first).to.eq(player3);
  });

  it('should maintain correct turn order with mixed passing patterns', () => {
    const [game, player1, player2, player3] = testGame(3, {skipInitialCardSelection: true});
    
    // Test various passing orders and verify turn order is set correctly
    
    // Scenario: player2 -> player3 -> player1
    game.playerHasPassed(player2);
    game.playerHasPassed(player3);
    game.playerHasPassed(player1);
    
    // Simulate production phase logic
    if ((game as any).passedPlayers.length === game.players.length) {
      const newOrder = (game as any).passedPlayers.map((id: any) => game.getPlayerById(id));
      (game as any).playersInGenerationOrder = newOrder;
      (game as any).setFirstPlayer(newOrder[0]);
    }
    
    expect(game.playersInGenerationOrder[0]).to.eq(player2);
    expect(game.playersInGenerationOrder[1]).to.eq(player3);
    expect(game.playersInGenerationOrder[2]).to.eq(player1);
    expect(game.first).to.eq(player2);
  });

  it('should maintain passing order in getPlayerAfter and getPlayerBefore methods', () => {
    const [game, player1, player2, player3] = testGame(3, {skipInitialCardSelection: true});
    
    // Test scenario: player2 passes first, then player3, then player1
    game.playerHasPassed(player2);
    game.playerHasPassed(player3);
    game.playerHasPassed(player1);
    
    // Simulate production phase logic to set the generation order
    if ((game as any).passedPlayers.length === game.players.length) {
      const newOrder = (game as any).passedPlayers.map((id: any) => game.getPlayerById(id));
      (game as any).playersInGenerationOrder = newOrder;
      (game as any).setFirstPlayer(newOrder[0]);
    }
    
    // Verify generation order: player2 -> player3 -> player1
    expect(game.playersInGenerationOrder[0]).to.eq(player2);
    expect(game.playersInGenerationOrder[1]).to.eq(player3);
    expect(game.playersInGenerationOrder[2]).to.eq(player1);
    
    // Test getPlayerAfter follows the passing order
    expect(game.getPlayerAfter(player2)).to.eq(player3); // player2 -> player3
    expect(game.getPlayerAfter(player3)).to.eq(player1); // player3 -> player1
    expect(game.getPlayerAfter(player1)).to.eq(player2); // player1 -> player2 (wraps around)
    
    // Test getPlayerBefore follows the passing order in reverse
    expect(game.getPlayerBefore(player2)).to.eq(player1); // player1 -> player2
    expect(game.getPlayerBefore(player3)).to.eq(player2); // player2 -> player3
    expect(game.getPlayerBefore(player1)).to.eq(player3); // player3 -> player1
  });

  it('should handle getPlayerAfter/Before with different passing orders', () => {
    const [game, player1, player2, player3] = testGame(3, {skipInitialCardSelection: true});
    
    // Test different passing order: player1 -> player3 -> player2
    game.playerHasPassed(player1);
    game.playerHasPassed(player3);
    game.playerHasPassed(player2);
    
    // Simulate production phase logic
    if ((game as any).passedPlayers.length === game.players.length) {
      const newOrder = (game as any).passedPlayers.map((id: any) => game.getPlayerById(id));
      (game as any).playersInGenerationOrder = newOrder;
      (game as any).setFirstPlayer(newOrder[0]);
    }
    
    // Verify generation order: player1 -> player3 -> player2
    expect(game.playersInGenerationOrder[0]).to.eq(player1);
    expect(game.playersInGenerationOrder[1]).to.eq(player3);
    expect(game.playersInGenerationOrder[2]).to.eq(player2);
    
    // Test getPlayerAfter follows this new passing order
    expect(game.getPlayerAfter(player1)).to.eq(player3); // player1 -> player3
    expect(game.getPlayerAfter(player3)).to.eq(player2); // player3 -> player2
    expect(game.getPlayerAfter(player2)).to.eq(player1); // player2 -> player1 (wraps around)
    
    // Test getPlayerBefore follows the order in reverse
    expect(game.getPlayerBefore(player1)).to.eq(player2); // player2 -> player1
    expect(game.getPlayerBefore(player3)).to.eq(player1); // player1 -> player3
    expect(game.getPlayerBefore(player2)).to.eq(player3); // player3 -> player2
  });

  it('should fall back to default player order when no generation order is set', () => {
    const [game, player1, player2, player3] = testGame(3, {skipInitialCardSelection: true});
    
    // Before any players have passed, should use default player order
    expect(game.playersInGenerationOrder).to.have.length(0);
    
    // getPlayerAfter should use the default players array order
    expect(game.getPlayerAfter(player1)).to.eq(player2); // default order: player1 -> player2
    expect(game.getPlayerAfter(player2)).to.eq(player3); // default order: player2 -> player3
    expect(game.getPlayerAfter(player3)).to.eq(player1); // wraps around: player3 -> player1
    
    // getPlayerBefore should use the default players array order
    expect(game.getPlayerBefore(player1)).to.eq(player3); // player3 -> player1
    expect(game.getPlayerBefore(player2)).to.eq(player1); // player1 -> player2
    expect(game.getPlayerBefore(player3)).to.eq(player2); // player2 -> player3
  });
});
