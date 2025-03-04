import {AMAZONIS_PLANITIA_AWARDS, ARABIA_TERRA_AWARDS, ARES_AWARDS, Awards, ELYSIUM_AWARDS, HELLAS_AWARDS, MOON_AWARDS, THARSIS_AWARDS, TERRA_CIMMERIA_AWARDS, VASTITAS_BOREALIS_AWARDS, VENUS_AWARDS} from './awards/Awards';
import {Banker} from './awards/Banker';
import {Benefactor} from './awards/Benefactor';
import {Celebrity} from './awards/Celebrity';
import {Contractor} from './awards/Contractor';
import {Cultivator} from './awards/Cultivator';
import {DesertSettler} from './awards/DesertSettler';
import {Entrepreneur} from './awards/Entrepreneur';
import {EstateDealer} from './awards/EstateDealer';
import {Excentric} from './awards/Excentric';
import {IAward} from './awards/IAward';
import {Industrialist} from './awards/Industrialist';
import {Landlord} from './awards/Landlord';
import {Magnate} from './awards/Magnate';
import {Miner} from './awards/Miner';
import {Scientist} from './awards/Scientist';
import {SpaceBaron} from './awards/SpaceBaron';
import {Thermalist} from './awards/Thermalist';
import {Venuphile} from './awards/Venuphile';
import {BoardName} from '../common/boards/BoardName';
import {GameOptions} from './GameOptions';
import {Builder} from './milestones/Builder';
import {Diversifier} from './milestones/Diversifier';
import {Ecologist} from './milestones/Ecologist';
import {Energizer} from './milestones/Energizer';
import {Gardener} from './milestones/Gardener';
import {Generalist} from './milestones/Generalist';
import {Hoverlord} from './milestones/Hoverlord';
import {IMilestone} from './milestones/IMilestone';
import {Mayor} from './milestones/Mayor';
import {AMAZONIS_PLANITIA_MILESTONES, ARABIA_TERRA_MILESTONES, ARES_MILESTONES, ELYSIUM_MILESTONES, HELLAS_MILESTONES, Milestones, MOON_MILESTONES, THARSIS_MILESTONES, TERRA_CIMMERIA_MILESTONES, VASTITAS_BOREALIS_MILESTONES, VENUS_MILESTONES} from './milestones/Milestones';
import {Networker} from './milestones/Networker';
import {Planner} from './milestones/Planner';
import {PolarExplorer} from './milestones/PolarExplorer';
import {RimSettler} from './milestones/RimSettler';
import {Specialist} from './milestones/Specialist';
import {Tactician} from './milestones/Tactician';
import {Terraformer} from './milestones/Terraformer';
import {Tycoon} from './milestones/Tycoon';
import {FullMoon} from './moon/FullMoon';
import {Lunarchitect} from './moon/Lunarchitect';
import {LunarMagnate} from './moon/LunarMagnate';
import {OneGiantStep} from './moon/OneGiantStep';
import {RandomMAOptionType} from '../common/ma/RandomMAOptionType';
import {Adapter} from './awards/Adapter';
import {Edgedancer} from './awards/Edgedancer';
import {Naturalist} from './awards/Naturalist';
import {Irrigator} from './milestones/Irrigator';
import {Smith} from './milestones/Smith';
import {Tradesman} from './milestones/Tradesman';
import {Voyager} from './awards/Voyager';
import {inplaceShuffle} from './utils/shuffle';
import {UnseededRandom} from './Random';
import {MilestoneName} from '../common/ma/MilestoneName';
import {AwardName} from '../common/ma/AwardName';
import {inplaceRemove} from '../common/utils/utils';
import {Colonizer} from './milestones/amazonisPlanitia/Colonizer';
import {Pioneer} from './milestones/Pioneer';

type DrawnMilestonesAndAwards = {
  milestones: Array<IMilestone>,
  awards: Array<IAward>
}

// This map uses keys of the format "X|Y" where X and Y are MA names. Entries are stored as "X|Y"
// and also "Y|X"; it just makes searching slightly faster. There will also be entries of the type "X|X".
//
// I honestly don't remember why "X|X" is useful, and it's possible it's no longer necessary. That's
// something that should be carefully conisdered and possibly removed, and not just propagated because
// it's what we had to begin with. In other words, someone figure out why, and preserve it, and document
// why, or be certain it's unnecessary and remove this paragraph and the code below that sets "X|X" to 1000.
//
class SynergyMap {
  private readonly map: Map<string, number> = new Map();
  public set(a: string, b: string, weight: number): void {
    this.map.set(a + '|' + b, weight);
    this.map.set(b + '|' + a, weight);
  }

  public get(a: string, b: string) {
    return this.map.get(a + '|' + b) || 0;
  }
}

class Synergies {
  public static map: SynergyMap = Synergies.makeMap();

  private constructor() {
  }

  private static makeMap(): SynergyMap {
    const synergies = new SynergyMap();

      // Higher synergies represent similar milestones or awards. For instance, Terraformer rewards for high TR
      // and the Benefactor award is given to the player with the highets TR. Their synergy weight is 9, very high.
      function bind(A: { new(): IMilestone | IAward }, B: { new(): IMilestone | IAward }, weight: number):void;
      function bind(a: string, b: string, weight: number):void;
      function bind(A: any, B: any, weight: number):void {
        if (typeof A === 'string') {
          synergies.set(A, B, weight);
        } else {
          synergies.set(new A().name, new B().name, weight);
        }
      }

      Milestones.ALL.forEach((ma) => {
        bind(ma.name, ma.name, 1000);
      });
      Awards.ALL.forEach((ma) => {
        bind(ma.name, ma.name, 1000);
      });

      bind(Terraformer, Benefactor, 9);
      bind(Gardener, Cultivator, 9);
      bind(Builder, Contractor, 9);
      bind(Networker, Entrepreneur, 9);
      bind(OneGiantStep, FullMoon, 9);
      bind(Lunarchitect, LunarMagnate, 9);
      bind(OneGiantStep, Lunarchitect, 9);
      bind(FullMoon, LunarMagnate, 9);
      bind(EstateDealer, Cultivator, 8);
      bind(Landlord, Cultivator, 8);
      bind(Landlord, DesertSettler, 7);
      bind(Landlord, EstateDealer, 7);
      bind(DesertSettler, Cultivator, 7);
      bind(Miner, Industrialist, 7);
      bind(OneGiantStep, LunarMagnate, 7);
      bind(Lunarchitect, FullMoon, 7);
      bind(Energizer, Industrialist, 6);
      bind(Gardener, Landlord, 6);
      bind(Mayor, Landlord, 6);
      bind(Mayor, Cultivator, 6);
      bind(Gardener, EstateDealer, 5);
      bind(Builder, Magnate, 5);
      bind(Tycoon, Magnate, 5);
      bind(PolarExplorer, DesertSettler, 5);
      bind(Hoverlord, Excentric, 5);
      bind(Hoverlord, Venuphile, 5);
      bind(DesertSettler, EstateDealer, 5);
      bind(Builder, Tycoon, 4);
      bind(Specialist, Energizer, 4);
      bind(Mayor, PolarExplorer, 4);
      bind(Mayor, DesertSettler, 4);
      bind(Mayor, EstateDealer, 4);
      bind(Gardener, PolarExplorer, 4);
      bind(Gardener, DesertSettler, 4);
      bind(Ecologist, Excentric, 4);
      bind(PolarExplorer, Landlord, 4);
      bind(Mayor, Gardener, 3);
      bind(Tycoon, Excentric, 3);
      bind(PolarExplorer, Cultivator, 3);
      bind(Energizer, Thermalist, 3);
      bind(RimSettler, SpaceBaron, 3);
      bind(Celebrity, SpaceBaron, 3);
      bind(Benefactor, Cultivator, 3);
      bind(Gardener, Benefactor, 2);
      bind(Specialist, Banker, 2);
      bind(Ecologist, Tycoon, 2);
      bind(Ecologist, Diversifier, 2);
      bind(Tycoon, Scientist, 2);
      bind(Tycoon, Contractor, 2);
      bind(Tycoon, Venuphile, 2);
      bind(PolarExplorer, EstateDealer, 2);
      bind(RimSettler, Celebrity, 2);
      bind(Scientist, Magnate, 2);
      bind(Magnate, SpaceBaron, 2);
      bind(Excentric, Venuphile, 2);
      bind(Terraformer, Cultivator, 2);
      bind(Terraformer, Gardener, 2);
      bind(Builder, Miner, 1);
      bind(Builder, Industrialist, 1);
      bind(Planner, Scientist, 1);
      bind(Generalist, Miner, 1);
      bind(Specialist, Thermalist, 1);
      bind(Specialist, Miner, 1);
      bind(Specialist, Industrialist, 1);
      bind(Ecologist, Cultivator, 1);
      bind(Ecologist, Magnate, 1);
      bind(Tycoon, Diversifier, 1);
      bind(Tycoon, Tactician, 1);
      bind(Tycoon, RimSettler, 1);
      bind(Tycoon, SpaceBaron, 1);
      bind(Diversifier, Magnate, 1);
      bind(Tactician, Scientist, 1);
      bind(Tactician, Magnate, 1);
      bind(RimSettler, Magnate, 1);
      bind(Banker, Benefactor, 1);
      bind(Celebrity, Magnate, 1);
      bind(DesertSettler, Benefactor, 1);
      bind(EstateDealer, Benefactor, 1);
      bind(Terraformer, Landlord, 1);
      bind(Terraformer, Thermalist, 1);
      bind(Terraformer, DesertSettler, 1);
      bind(Terraformer, EstateDealer, 1);
      bind(Gardener, Ecologist, 1);

      // Vastitas Borealis
      bind(Smith, Generalist, 2);
      bind(Smith, Specialist, 5);
      bind(Smith, RimSettler, 3);
      bind(Smith, Miner, 8);
      bind(Smith, Industrialist, 5);

      bind(Tradesman, Ecologist, 6);
      bind(Tradesman, Diversifier, 3);
      bind(Tradesman, Hoverlord, 6);
      bind(Tradesman, Excentric, 8);
      bind(Tradesman, Venuphile, 4);

      bind(Irrigator, Mayor, 3);
      bind(Irrigator, Gardener, 3);
      bind(Irrigator, PolarExplorer, 3);
      bind(Irrigator, Landlord, 4);
      bind(Irrigator, DesertSettler, 5);
      bind(Irrigator, EstateDealer, 9);
      bind(Irrigator, Cultivator, 4);

      bind(Adapter, Ecologist, 2);
      bind(Adapter, Tactician, 3);
      bind(Adapter, Scientist, 5);

      bind(Edgedancer, Mayor, 2);
      bind(Edgedancer, Gardener, 4);
      bind(Edgedancer, PolarExplorer, 5);
      bind(Edgedancer, DesertSettler, 5);
      bind(Edgedancer, EstateDealer, 1);
      bind(Edgedancer, Cultivator, 4);
      bind(Edgedancer, Irrigator, 1);

      bind(Naturalist, Terraformer, 3);
      bind(Naturalist, Gardener, 2);
      bind(Naturalist, Generalist, 2);
      bind(Naturalist, Specialist, 1);
      bind(Naturalist, Landlord, 4);
      bind(Naturalist, Thermalist, 6);
      bind(Naturalist, DesertSettler, 1);
      bind(Naturalist, EstateDealer, 1);
      bind(Naturalist, Benefactor, 5);
      bind(Naturalist, Cultivator, 3);
      bind(Naturalist, Edgedancer, 1);

      // Start of fan synergies:
      bind(Voyager, RimSettler, 9);
      bind(Pioneer, Colonizer, 9);

      return synergies;
  }
}

// Function to compute max synergy of a given set of milestones and awards.
// Exported for testing
export function maximumSynergy(names: Array<string>) : number {
  let max = 0;
  for (let i = 0; i < names.length - 1; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const synergy = Synergies.map.get(names[i], names[j]);
      max = Math.max(synergy, max);
    }
  }
  return max;
}

type Constraints = {
    // No pairing may have a synergy greater than this.
    maxSynergyAllowed: number;
    // Sum of all the synergies may be no greater than this.
    totalSynergyAllowed: number;
    // 3) Limited a number of pair with synergy at |highThreshold| or above to |numberOfHighAllowed| or below.
    numberOfHighAllowed: number;
    highThreshold: number;
  }

export const LIMITED_SYNERGY: Constraints = {
  maxSynergyAllowed: 6,
  totalSynergyAllowed: 20,
  numberOfHighAllowed: 20,
  highThreshold: 4,
};

const UNLIMITED_SYNERGY: Constraints = {
  maxSynergyAllowed: 100,
  totalSynergyAllowed: 100,
  numberOfHighAllowed: 100,
  highThreshold: 100,
};

export function chooseMilestonesAndAwards(gameOptions: GameOptions): DrawnMilestonesAndAwards {
  let drawnMilestonesAndAwards: DrawnMilestonesAndAwards = {
    milestones: [],
    awards: [],
  };

  function push(milestones: Array<IMilestone>, awards: Array<IAward>) {
    drawnMilestonesAndAwards.milestones.push(...milestones);
    drawnMilestonesAndAwards.awards.push(...awards);
  }

  const includeVenus = gameOptions.venusNextExtension && gameOptions.includeVenusMA;
  const requiredQty = includeVenus ? 6 : 5;

  switch (gameOptions.randomMA) {
  case RandomMAOptionType.NONE:
    switch (gameOptions.boardName) {
    case BoardName.THARSIS:
      push(THARSIS_MILESTONES, THARSIS_AWARDS);
      break;
    case BoardName.HELLAS:
      push(HELLAS_MILESTONES, HELLAS_AWARDS);
      break;
    case BoardName.ELYSIUM:
      push(ELYSIUM_MILESTONES, ELYSIUM_AWARDS);
      break;
    case BoardName.ARABIA_TERRA:
      push(ARABIA_TERRA_MILESTONES, ARABIA_TERRA_AWARDS);
      break;
    case BoardName.AMAZONIS:
      push(AMAZONIS_PLANITIA_MILESTONES, AMAZONIS_PLANITIA_AWARDS);
      break;
    case BoardName.TERRA_CIMMERIA:
      push(TERRA_CIMMERIA_MILESTONES, TERRA_CIMMERIA_AWARDS);
      break;
    case BoardName.VASTITAS_BOREALIS:
      push(VASTITAS_BOREALIS_MILESTONES, VASTITAS_BOREALIS_AWARDS);
      break;
    }
    if (includeVenus) {
      push(VENUS_MILESTONES, VENUS_AWARDS);
    }
    if (gameOptions.aresExtension) {
      push(ARES_MILESTONES, ARES_AWARDS);
    }
    if (gameOptions.moonExpansion) {
      // One MA will reward moon tags, the other will reward moon tiles.
      if (Math.random() > 0.5) {
        push([new OneGiantStep], [new LunarMagnate()]);
      } else {
        push([new Lunarchitect], [new FullMoon()]);
      }
    }
    break;

  case RandomMAOptionType.LIMITED:
    drawnMilestonesAndAwards = getRandomMilestonesAndAwards(gameOptions, requiredQty, LIMITED_SYNERGY);
    break;
  case RandomMAOptionType.UNLIMITED:
    drawnMilestonesAndAwards = getRandomMilestonesAndAwards(gameOptions, requiredQty, UNLIMITED_SYNERGY);
    break;
  default:
    throw new Error('Unknown milestone/award type: ' + gameOptions.randomMA);
  }

  return drawnMilestonesAndAwards;
}

// Selects |numberMARequested| milestones and |numberMARequested| awards from all available awards and milestones (optionally including
// Venusian.) It does this by following these rules:
// 1) No pair with synergy above |maxSynergyAllowed|.
// 2) Total synergy is |totalSynergyAllowed| or below.
// 3) Limited a number of pair with synergy at |highThreshold| or above to |numberOfHighAllowed| or below.
function getRandomMilestonesAndAwards(gameOptions: GameOptions,
  numberMARequested: number,
  constraints: Constraints,
  attempt: number = 1): DrawnMilestonesAndAwards {
  // 5 is a fine number of attempts. A sample of 100,000 runs showed that this algorithm
  // didn't get past 3.
  // https://github.com/terraforming-mars/terraforming-mars/pull/1637#issuecomment-711411034
  const maxAttempts = 5;
  if (attempt > maxAttempts) {
    throw new Error('No limited synergy milestones and awards set was generated after ' + maxAttempts + ' attempts. Please try again.');
  }

  function toName<T>(e: {name: T}): T {
    return e.name;
  }

  const candidateMilestones: Array<MilestoneName> = [...THARSIS_MILESTONES, ...ELYSIUM_MILESTONES, ...HELLAS_MILESTONES].map(toName);
  const candidateAwards: Array<AwardName> = [...THARSIS_AWARDS, ...ELYSIUM_AWARDS, ...HELLAS_AWARDS].map(toName);

  if (gameOptions.venusNextExtension && gameOptions.includeVenusMA) {
    candidateMilestones.push(...VENUS_MILESTONES.map(toName));
    candidateAwards.push(...VENUS_AWARDS.map(toName));
  }
  if (gameOptions.aresExtension) {
    candidateMilestones.push(...ARES_MILESTONES.map(toName));
    candidateAwards.push(...ARES_AWARDS.map(toName));
  }
  if (gameOptions.moonExpansion) {
    candidateMilestones.push(...MOON_MILESTONES.map(toName));
    candidateAwards.push(...MOON_AWARDS.map(toName));
  }

  if (gameOptions.includeFanMA) {
    candidateMilestones.push(
      ...ARABIA_TERRA_MILESTONES.map(toName),
      ...AMAZONIS_PLANITIA_MILESTONES.map(toName),
      ...TERRA_CIMMERIA_MILESTONES.map(toName),
      ...VASTITAS_BOREALIS_MILESTONES.map(toName));

    candidateAwards.push(
      ...ARABIA_TERRA_AWARDS.map(toName),
      ...AMAZONIS_PLANITIA_AWARDS.map(toName),
      ...TERRA_CIMMERIA_AWARDS.map(toName),
      ...VASTITAS_BOREALIS_AWARDS.map(toName));

    if (gameOptions.pathfindersExpansion !== true) {
      inplaceRemove(candidateMilestones, 'Martian');
    }
    if (gameOptions.coloniesExtension !== true) {
      inplaceRemove(candidateMilestones, 'Colonizer');
      inplaceRemove(candidateMilestones, 'Pioneer');
    }
    if (gameOptions.turmoilExtension !== true) {
      inplaceRemove(candidateAwards, 'Politician');
    }
  }

  // TODO(kberg): Find a way to add the Arabia Terra milestones and awards in.
  inplaceShuffle(candidateMilestones, UnseededRandom.INSTANCE);
  inplaceShuffle(candidateAwards, UnseededRandom.INSTANCE);

  const accum = new Accumulator(constraints);

  // Keep adding milestones or awards until there are as many as requested
  while (accum.milestones.length + accum.awards.length < numberMARequested * 2) {
    // If there is enough award, add a milestone. And vice versa. If still need both, flip a coin to decide which to add.
    if (accum.awards.length === numberMARequested || (accum.milestones.length !== numberMARequested && Math.round(Math.random()))) {
      const newMilestone = candidateMilestones.splice(0, 1)[0];
      // If not enough milestone are left to satisfy the constraints, restart the function with a recursive call.
      if (newMilestone === undefined) {
        return getRandomMilestonesAndAwards(gameOptions, numberMARequested, constraints, attempt+1);
      }
      accum.add(newMilestone, true);
    } else {
      const newAward = candidateAwards.splice(0, 1)[0];
      // If not enough awards are left to satisfy the constraints, restart the function with a recursive call.
      if (newAward === undefined) {
        return getRandomMilestonesAndAwards(gameOptions, numberMARequested, constraints, attempt+1);
      }
      accum.add(newAward, false);
    }
  }

  if (!verifySynergyRules(accum.milestones.concat(accum.awards), constraints)) {
    throw new Error('The randomized milestones and awards set does not satisfy the given synergy rules.');
  }

  return {
    milestones: accum.milestones.map((name) => Milestones.getByName(name)),
    awards: accum.awards.map((name) => Awards.getByName(name)),
  };
}

// Verify whether a given array of |milestoneAwardArray| satisfies the following these rules:
// 1) No pair with synergy above |maxSynergyAllowed|.
// 2) Total synergy is |totalSynergyAllowed| or below.
// 3) Limited a number of pair with synergy at |highThreshold| or above to |numberOfHighAllowed| or below.
export function verifySynergyRules(
  mas: Array<string>,
  constraints: Constraints): boolean {
  let max = 0;
  let totalSynergy = 0;
  let numberOfHigh = 0;
  for (let i = 0; i < mas.length - 1; i++) {
    for (let j = i + 1; j < mas.length; j++) {
      const synergy = Synergies.map.get(mas[i], mas[j]);
      max = Math.max(synergy, max);
      totalSynergy += synergy;
      if (synergy >= constraints.highThreshold) numberOfHigh++;
    }
  }
  return max <= constraints.maxSynergyAllowed &&
      totalSynergy <= constraints.totalSynergyAllowed &&
      numberOfHigh <= constraints.numberOfHighAllowed;
}

class Accumulator {
  milestones: Array<string> = [];
  awards: Array<string> = [];

  private accumulatedHighCount = 0;
  private accumulatedTotalSynergy = 0;

  constructor(private constraints: Constraints) {
  }

  // Conditionally add a milestone or award when it doesn't
  // violate synergy constraints.
  //
  // |ma| is the milestone or award, |milestone| is true when
  // |ma| represents a milestone and false when it represents
  // an award.
  //
  // Returns true when successful, false otherwise.
  //
  add(candidate: string, milestone: boolean): boolean {
    let totalSynergy = this.accumulatedTotalSynergy;
    let highCount = this.accumulatedHighCount;
    let max = 0;

    // Find the maximum synergy of this new item compared to the others
    this.milestones.concat(this.awards).forEach((ma) => {
      const synergy = Synergies.map.get(ma, candidate);
      totalSynergy += synergy;
      if (synergy >= this.constraints.highThreshold) {
        highCount++;
      }
      max = Math.max(synergy, max);
    });
    // Check whether the addition violates any rule.
    if (max <= this.constraints.maxSynergyAllowed &&
        highCount <= this.constraints.numberOfHighAllowed &&
        totalSynergy <= this.constraints.totalSynergyAllowed) {
      if (milestone) {
        this.milestones.push(candidate);
      } else {
        this.awards.push(candidate);
      }
      // Update the stats
      this.accumulatedHighCount = highCount;
      this.accumulatedTotalSynergy = totalSynergy;
      return true;
    } else {
      return false;
    }
  }
}
