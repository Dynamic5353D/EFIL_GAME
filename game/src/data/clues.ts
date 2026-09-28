/**
 * The Case Board (pause menu): what the friends piece together about the deaths in Act I. A clue can
 * carry a `truth` that replaces its text once the player knows what really happened (after V8).
 */
import { loc, type Loc } from '../core/Localization';

export interface ClueDef {
  id: string;
  title: Loc;
  body: Loc;
  /** Shown instead of `body` once the flag `truth_known` is set. */
  truth?: Loc;
}

const C = (id: string, title: Loc, body: Loc, truth?: Loc): ClueDef => ({ id, title, body, truth });

export const CLUES: Record<string, ClueDef> = {
  first_body: C('first_body',
    loc('The man on the cut road', 'Cut road-la kedandha aal'),
    loc('29 Sep. A man found on the cut road, beside the wall. No wounds. Not a student, not staff. Ragul walked past him that morning.',
      '29 Sep. Cut road-la, suvar pakkathula oru aal. Kaayam illa. Student illa, staff illa. Andha kaalaila Ragul avana thaandi ponaan.'),
    loc('Ragul touched him when he stepped over him. He knew what his touch could do.', 'Thaandumbodhu Ragul avana thottaan. Than thodudhal enna pannum-nu avanukku theriyum.')),
};
