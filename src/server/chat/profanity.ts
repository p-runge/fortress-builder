import { Filter } from "bad-words";

const profanityFilter = new Filter();

profanityFilter.addWords(
  ...[
    // custom blacklist
  ],
);

profanityFilter.removeWords(
  ...[
    // custom whitelist
  ],
);

export { profanityFilter };
