export enum TarotSpreadType {
  SINGLE_CARD = 'single_card',
  THREE_CARD = 'three_card',
  CELTIC_CROSS = 'celtic_cross',
  HORSESHOE = 'horseshoe',
  PENTAGRAM = 'pentagram',
  TREE_OF_LIFE = 'tree_of_life'
}

export interface TarotSpread {
  type: TarotSpreadType;
  name: string;
  description: string;
  cardCount: number;
  icon: string;
  positions: {
    name: string;
    description: string;
  }[];
}

export const TAROT_SPREADS: Record<TarotSpreadType, TarotSpread> = {
  [TarotSpreadType.SINGLE_CARD]: {
    type: TarotSpreadType.SINGLE_CARD,
    name: 'Single Card',
    description: 'A simple yet powerful spread for quick guidance or daily insight.',
    cardCount: 1,
    icon: 'CenterFocusStrong',
    positions: [
      {
        name: 'The Message',
        description: 'The key message or energy for your question'
      }
    ]
  },
  [TarotSpreadType.THREE_CARD]: {
    type: TarotSpreadType.THREE_CARD,
    name: 'Three Card Spread',
    description: 'Past, Present, and Future spread for temporal insight.',
    cardCount: 3,
    icon: 'Timeline',
    positions: [
      {
        name: 'Past',
        description: 'Influences from the past'
      },
      {
        name: 'Present',
        description: 'Current situation'
      },
      {
        name: 'Future',
        description: 'Potential outcome'
      }
    ]
  },
  [TarotSpreadType.CELTIC_CROSS]: {
    type: TarotSpreadType.CELTIC_CROSS,
    name: 'Celtic Cross',
    description: 'A comprehensive spread for deep insight into complex situations.',
    cardCount: 10,
    icon: 'ChangeHistory',
    positions: [
      {
        name: 'Present',
        description: 'Current situation'
      },
      {
        name: 'Challenge',
        description: 'What crosses you'
      },
      {
        name: 'Foundation',
        description: 'The basis of the situation'
      },
      {
        name: 'Recent Past',
        description: 'Recent influences'
      },
      {
        name: 'Potential',
        description: 'Best potential outcome'
      },
      {
        name: 'Near Future',
        description: 'Coming influences'
      },
      {
        name: 'Self',
        description: 'Your attitude'
      },
      {
        name: 'Environment',
        description: 'Others\' influence'
      },
      {
        name: 'Hopes/Fears',
        description: 'Your inner emotions'
      },
      {
        name: 'Outcome',
        description: 'Final outcome'
      }
    ]
  },
  [TarotSpreadType.HORSESHOE]: {
    type: TarotSpreadType.HORSESHOE,
    name: 'Horseshoe Spread',
    description: 'A seven-card spread focusing on problem-solving.',
    cardCount: 7,
    icon: 'AutoGraph',
    positions: [
      {
        name: 'Past',
        description: 'Past influences'
      },
      {
        name: 'Present',
        description: 'Current situation'
      },
      {
        name: 'Hidden Influences',
        description: 'Unseen factors'
      },
      {
        name: 'Obstacles',
        description: 'Challenges to overcome'
      },
      {
        name: 'External Influences',
        description: 'Outside factors'
      },
      {
        name: 'Guidance',
        description: 'Advice to consider'
      },
      {
        name: 'Outcome',
        description: 'Likely outcome'
      }
    ]
  },
  [TarotSpreadType.PENTAGRAM]: {
    type: TarotSpreadType.PENTAGRAM,
    name: 'Pentagram Spread',
    description: 'A five-card spread representing the elements and spirit.',
    cardCount: 5,
    icon: 'Star',
    positions: [
      {
        name: 'Spirit',
        description: 'Higher guidance'
      },
      {
        name: 'Fire',
        description: 'Passion and energy'
      },
      {
        name: 'Water',
        description: 'Emotions and intuition'
      },
      {
        name: 'Air',
        description: 'Thoughts and communication'
      },
      {
        name: 'Earth',
        description: 'Physical and material aspects'
      }
    ]
  },
  [TarotSpreadType.TREE_OF_LIFE]: {
    type: TarotSpreadType.TREE_OF_LIFE,
    name: 'Tree of Life',
    description: 'A spiritual spread based on the Kabbalah Tree of Life.',
    cardCount: 10,
    icon: 'AccountTree',
    positions: [
      {
        name: 'Crown',
        description: 'Higher purpose'
      },
      {
        name: 'Wisdom',
        description: 'Knowledge and understanding'
      },
      {
        name: 'Understanding',
        description: 'Comprehension and growth'
      },
      {
        name: 'Mercy',
        description: 'Grace and compassion'
      },
      {
        name: 'Severity',
        description: 'Discipline and boundaries'
      },
      {
        name: 'Beauty',
        description: 'Harmony and balance'
      },
      {
        name: 'Victory',
        description: 'Achievement and progress'
      },
      {
        name: 'Splendor',
        description: 'Intellect and communication'
      },
      {
        name: 'Foundation',
        description: 'Base and stability'
      },
      {
        name: 'Kingdom',
        description: 'Manifestation and reality'
      }
    ]
  }
}; 