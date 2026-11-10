// Comprehensive automated test suite simulating multiplayer scenarios
import { io } from 'socket.io-client';
import http from 'http';
import { dictionary } from './server/data/dictionary.js';
import { SOCKET_EVENTS } from './shared/constants.js';

const SERVER_URL = 'http://localhost:3001';

function createClient(name, token) {
  return io(SERVER_URL, {
    transports: ['websocket'],
    forceNew: true
  });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runTests() {
  console.log('🧪 Starting Kelime Bombası Multiplayer Test Suite...\n');

  // Test 1: Turkish Dictionary & Character Nuances
  console.log('--- Test 1: Turkish String & Dictionary Accuracy ---');
  dictionary.load();
  
  const mustBeValid = ['karpuz', 'makarna', 'ankara', 'kitap', 'kitaplar', 'evler', 'istanbul', 'şeker', 'ağaç', 'özlem'];
  for (const w of mustBeValid) {
    const valid = dictionary.isValidWord(w);
    if (!valid) throw new Error(`Word '${w}' should be valid in dictionary!`);
  }
  console.log('✅ Turkish words validated successfully.');

  // Test Turkish Upper/Lower nuances
  if (!dictionary.isValidWord('İSTANBUL') || !dictionary.isValidWord('istanbul')) {
    throw new Error('Turkish İ/i case conversion failed!');
  }
  if (!dictionary.isValidWord('IŞIK') || !dictionary.isValidWord('ışık')) {
    throw new Error('Turkish I/ı case conversion failed!');
  }
  console.log('✅ Turkish İ/i and I/ı cases verified.');

  // Test 2: Multiplayer Room Creation & Rules
  console.log('\n--- Test 2: Room Creation & Host Permissions ---');
  const tokenHost = 'tok_host_' + Date.now();
  const socketHost = createClient('Ahmet', tokenHost);

  await new Promise((resolve) => socketHost.on('connect', resolve));

  // Host creates room
  const createRes = await new Promise((resolve) => {
    socketHost.emit(SOCKET_EVENTS.CREATE_ROOM, {
      sessionToken: tokenHost,
      name: 'Ahmet',
      avatar: '💣',
      color: '#FF3B30'
    }, resolve);
  });

  if (!createRes.success) throw new Error('Create room failed: ' + createRes.error);
  const roomCode = createRes.roomCode;
  console.log(`✅ Room created successfully with code: ${roomCode}`);
  if (!createRes.player.isHost) throw new Error('First player must be host!');
  console.log('✅ First player is correctly assigned as Host with 👑');

  // Test 3: Host tries to start game with only 1 player (Must FAIL)
  console.log('\n--- Test 3: 1-Player Start Prevention ---');
  const startFailRes = await new Promise((resolve) => {
    socketHost.emit(SOCKET_EVENTS.START_GAME, {
      roomCode,
      sessionToken: tokenHost
    }, resolve);
  });
  if (startFailRes.success) throw new Error('Game started with only 1 player! Should be rejected.');
  console.log(`✅ Game rejected single-player start as expected: "${startFailRes.error}"`);

  // Test 4: Second player joins with DUPLICATE name (Must FAIL)
  console.log('\n--- Test 4: Duplicate Nickname Prevention ---');
  const tokenP2 = 'tok_p2_' + Date.now();
  const socketP2 = createClient('ahmet', tokenP2);
  await new Promise(r => socketP2.on('connect', r));

  const dupNameRes = await new Promise((resolve) => {
    socketP2.emit(SOCKET_EVENTS.JOIN_ROOM, {
      roomCode,
      sessionToken: tokenP2,
      name: 'ahmet', // Same name lowercase
      avatar: '🔥',
      color: '#FF9500'
    }, resolve);
  });
  if (dupNameRes.success) throw new Error('Duplicate nickname was accepted in the same room!');
  console.log(`✅ Duplicate name was correctly rejected: "${dupNameRes.error}"`);

  // Second player joins with valid unique name
  const validJoinRes = await new Promise((resolve) => {
    socketP2.emit(SOCKET_EVENTS.JOIN_ROOM, {
      roomCode,
      sessionToken: tokenP2,
      name: 'Zeynep',
      avatar: '🔥',
      color: '#FF9500'
    }, resolve);
  });
  if (!validJoinRes.success) throw new Error('Join room failed: ' + validJoinRes.error);
  console.log('✅ Second player "Zeynep" joined successfully.');

  // Test 5: Non-host tries to start game (Must FAIL)
  console.log('\n--- Test 5: Non-Host Start Prevention ---');
  const nonHostStart = await new Promise((resolve) => {
    socketP2.emit(SOCKET_EVENTS.START_GAME, {
      roomCode,
      sessionToken: tokenP2
    }, resolve);
  });
  if (nonHostStart.success) throw new Error('Non-host player was able to start game!');
  console.log(`✅ Non-host starting attempt blocked: "${nonHostStart.error}"`);

  // Test 6: Third and Fourth players join for a 4-player match
  console.log('\n--- Test 6: 4-Player Lobby & Host Settings ---');
  const tokenP3 = 'tok_p3_' + Date.now();
  const socketP3 = createClient('Mehmet', tokenP3);
  await new Promise(r => socketP3.on('connect', r));
  await new Promise(r => socketP3.emit(SOCKET_EVENTS.JOIN_ROOM, {
    roomCode, sessionToken: tokenP3, name: 'Mehmet', avatar: '😎', color: '#34C759'
  }, r));

  const tokenP4 = 'tok_p4_' + Date.now();
  const socketP4 = createClient('Elif', tokenP4);
  await new Promise(r => socketP4.on('connect', r));
  await new Promise(r => socketP4.emit(SOCKET_EVENTS.JOIN_ROOM, {
    roomCode, sessionToken: tokenP4, name: 'Elif', avatar: '🚀', color: '#007AFF'
  }, r));

  console.log('✅ 4 players connected in room.');

  // Host updates settings: lives=2, speed='cilgin'
  const settingsRes = await new Promise(r => socketHost.emit(SOCKET_EVENTS.UPDATE_SETTINGS, {
    roomCode, sessionToken: tokenHost, settings: { lives: 2, speed: 'cilgin' }
  }, r));
  if (!settingsRes.success) throw new Error('Settings update failed');
  console.log('✅ Host adjusted settings live (Lives: 2, Speed: Çılgın).');

  // Test 7: Host Starts Game (Countdown -> In Game)
  console.log('\n--- Test 7: Starting Match & Turn Flow ---');
  let gameStarted = false;
  socketHost.on(SOCKET_EVENTS.GAME_STARTED, () => {
    gameStarted = true;
  });

  const turnStartedPromise = new Promise(resolve => {
    socketHost.on(SOCKET_EVENTS.TURN_STARTED, resolve);
  });

  const startRes = await new Promise(r => socketHost.emit(SOCKET_EVENTS.START_GAME, {
    roomCode, sessionToken: tokenHost
  }, r));
  if (!startRes.success) throw new Error('Start game failed: ' + startRes.error);
  console.log('✅ Countdown initiated (3 seconds)...');

  // Wait for countdown to finish & first turn
  const currentTurn = await turnStartedPromise;
  console.log(`✅ Game active! First turn: Player "${currentTurn.activePlayer.name}", Syllable: "${currentTurn.syllable}"`);

  // Active player submits an INVALID word (doesn't contain syllable)
  const activeSocket = currentTurn.activePlayer.sessionToken === tokenHost ? socketHost :
                       currentTurn.activePlayer.sessionToken === tokenP2 ? socketP2 :
                       currentTurn.activePlayer.sessionToken === tokenP3 ? socketP3 : socketP4;

  const wrongWordRes = await new Promise(r => activeSocket.emit(SOCKET_EVENTS.SUBMIT_WORD, {
    roomCode, sessionToken: currentTurn.activePlayer.sessionToken, word: 'xyzgeçersiz'
  }, r));
  if (wrongWordRes.success) throw new Error('Invalid word was accepted!');
  console.log(`✅ Invalid word properly rejected: "${wrongWordRes.error}"`);

  // Active player submits a VALID word
  // Find a word from dictionary containing the syllable
  let validWord = null;
  const sylLower = currentTurn.syllable.toLocaleLowerCase('tr-TR');
  for (const w of dictionary.wordsSet) {
    if (w.includes(sylLower) && w.length >= 3) {
      validWord = w;
      break;
    }
  }

  if (!validWord) throw new Error(`Could not find dictionary word containing "${currentTurn.syllable}"`);
  console.log(`Submitting valid word: "${validWord}"`);

  const acceptedPromise = new Promise(r => socketHost.on(SOCKET_EVENTS.WORD_ACCEPTED, r));
  const submitRes = await new Promise(r => activeSocket.emit(SOCKET_EVENTS.SUBMIT_WORD, {
    roomCode, sessionToken: currentTurn.activePlayer.sessionToken, word: validWord
  }, r));
  if (!submitRes.success) throw new Error('Valid word was rejected: ' + submitRes.error);

  const acceptedData = await acceptedPromise;
  console.log(`✅ Word "${acceptedData.word}" accepted in ${acceptedData.timeSeconds}s! Bomb passed to next player.`);

  // Test 8: Re-using the same word in the same game (Must FAIL)
  console.log('\n--- Test 8: Re-use Prevention ---');
  const nextTurn = await new Promise(r => socketHost.on(SOCKET_EVENTS.TURN_STARTED, r));
  const nextSocket = nextTurn.activePlayer.sessionToken === tokenHost ? socketHost :
                     nextTurn.activePlayer.sessionToken === tokenP2 ? socketP2 :
                     nextTurn.activePlayer.sessionToken === tokenP3 ? socketP3 : socketP4;

  const reuseRes = await new Promise(r => nextSocket.emit(SOCKET_EVENTS.SUBMIT_WORD, {
    roomCode, sessionToken: nextTurn.activePlayer.sessionToken, word: validWord
  }, r));
  if (reuseRes.success) throw new Error('Re-used word was accepted!');
  console.log(`✅ Word re-use properly rejected: "${reuseRes.error}"`);

  // Test 9: Active player disconnects mid-turn (Game must NOT freeze)
  console.log('\n--- Test 9: Active Player Disconnect Handling (Never Hang) ---');
  console.log(`Disconnecting active player "${nextTurn.activePlayer.name}"...`);
  
  const bombPassPromise = new Promise(r => socketHost.on(SOCKET_EVENTS.TURN_STARTED, r));
  nextSocket.disconnect();

  const passedTurn = await bombPassPromise;
  console.log(`✅ Active player disconnected! Bomb immediately passed to "${passedTurn.activePlayer.name}". Game did not freeze!`);

  // Close remaining sockets
  socketHost.disconnect();
  socketP2.disconnect();
  socketP3.disconnect();
  socketP4.disconnect();

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! The multiplayer engine is rock solid.\n');
  process.exit(0);
}

// Start test
setTimeout(() => {
  runTests().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
}, 1000);
