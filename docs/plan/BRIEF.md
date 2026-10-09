<!-- ROLE: the user's (TJO's) requirements for the course upgrade, as stated on 2026-10-09.
     Authored by TJO; reproduced here so every planning lane reads the same text.
     UPDATE POLICY: only TJO changes this. -->

# Brief: Theoretische Physik C, major upgrade

I have taught Theoretische Physik C multiple times in the past. I have videos, there is the script you already have.

Now that agentic tools have become so capable I think it is time for a major upgrade of my teaching material, and also, the content.

I have several objectives that may appear at first sight to be contradictory, yet I want to have my cake and eat it too!

I want to create a document, or rather, several artifacts, in the form of documents, webpages, apps, videos, interactive demos, and actual games which explain my approach to quantum mechanics and many body physics through to statistical physics and thermodynamics.

The course then follows one path through the material, and is exposed to the "less challenging" content. The target audience are Lehramt students (trainee secondary-school teachers), who are typically overwhelmed by deep math. Nevertheless, this student group is way more motivated than pure BSc students and they often invest way more work into the material and end up being *better* than pure physics students. It is wild.

I am thinking I want to present a "choose your own adventure" style course. Where you can optionally, at any moment, navigate from "zoomed out" content into more details by clicking into it and expanding it.

For a pdf document version of the material this is evidently more challenging to do, but I am reminded by Misner, Thorne and Wheeler's solution to the problem with track 1 and 2. I kind of like that, but do want to research other solutions scientific authors have tried out for this challenge.

I also want the print pdf document to be typeset beautifully. Physics and math is typically typeset like crap, and design has stayed in the 1900s. I feel like Tufte was the only person people know who thought about presentation of complex info, but this is super old fashioned already. I am *sure* that there have been multiple innovations in the presentation of complex info in the past 5 years. I want to explore this space deeply to find complementary design philosophies:

(1) There is to be a canonical pdf print document which is comprehensive: all relevant info must be here.
(2) There are to be multiple webpage/html artifacts which exploit every device modern js/ts offers us, from three.js onwards. Probably one html per chapter or so.
(3) I also want there to be *actual games* (runnable in html), which gamify certain concepts.
(4) I also want 3d videos, renders, etc. that allow explanation of complex content like the hydrogen atom etc.

Not negotiable: everything *must* be correct, as in mathematically correct where possible, physically correct always. So a 3d vis of the orbitals of a hydrogen-like atom must literally be cloud renders of the correct probability densities. etc. etc.

The design package must be consistent and coherent across all these constructs. Opus and Sonnet may do the research.

Thus a key deliverable is: 3-5 design packages which exploit the very best in professional tasteful design. For the print pdf document I do prefer Times + MathTime fonts, but this is totally up for negotiation. Opus subagents prepare these design packages.

Once the design packages have been prepared we must plan the content.

## The physics approach

Our entire presentation works like this: we go from microscopic to macroscopic.

"zoomed in" = fundamental theory of physics (GPT = general probabilistic theory) -> "zoom out" QM of single systems -> "zoom out" many particles -> "zoom out" indefinite number of particles (Fock space) -> "zoom out and lose info" stat mech: ensembles, fundamental hypothesis of stat mech -> "zoom out" thermodynamics as the ultimate effective theory of all physics at the macroscale.

I am an operationalist at heart, following the Ludwig-Werner school. But I deviate in several ways. Thus I prefer the following framing of physics:

0. A physical theory supplies data for preparations + dynamics + measurement.
1. All physical theories are probabilistic theories (I think of deterministic as a subset of probabilistic).
2. Thus our presentation starts with probability theory, with notation and framing adapted to physics: we use the language of preparations (= states) instead of "probability measures"; measurements/instruments/POVMs are then elements of the dual space to states.
3. All physical theories, for me, are Archimedean order unit spaces. I tend to follow Plavala's presentation: https://arxiv.org/abs/2103.07469. It is possible to get lost in this rabbit hole; we try to keep this to a minimum. The GPT presentation allows us to present the postulates of a physical theory which we subsequently *specialise* to QM next.
4. We hence present the "postulates" of quantum mechanics incrementally, in order of increasing specialisation:

   P0. Physical theories are probabilistic theories: predictions in the form of probabilities.
   P1. To every quantum mechanical system we assign a Hilbert space (*) (this is morally part of the definition of the state space for a GPT).
   P2. State space = positive linear functionals on B(H) with norm 1. In the trace-class case these are density operators. Extreme points => pure states.
   P3. Detectors = dual of state space = operators E with 0 <= E <= I.
   P4. Born rule = probability of detection for a state prepared as density operator rho is tr(rho E).
   P5. That is it; dynamics are symmetries. But let us add, as in the notes, the specification of the Heisenberg/Schroedinger dynamics.

   (*) Many-body QM is an extension of this axiom, and introduces the tensor operation, direct sum.

5. What is the right Hilbert space? Experiments tell us. "Quantisation" is a fallacy (the universe was always quantum); "classical" systems are approximations to decohered dynamics.

6. Now present preparation uncertainty. Follow Werner in the careful presentation of preparation vs measurement uncertainty. Everyone screws this up for some reason.

7. Now the examples: qubit, particle in the box, quantum harmonic oscillator.

Parallel path: the road to dynamics (and axiom P5)

8. Symmetries: Wigner's theorem in all its forms tells us all symmetries in physics are group representations on the allowed class of morphisms of the GPT.
9. Dynamics = group representation of the real numbers. Relativistic = Lorentz representation etc.
10. Rotation symmetries => representation of the rotation group.

Return to main path.

11. Rotations in QM: projective unitary representations of SO(3). We go from group to Lie algebra. Angular momentum is the representation theory of SO(3).
12. Hydrogen atom: we do this properly, following B. Simon, and we worry about the Hamiltonian being self-adjoint with the correct boundary conditions etc. Of course, there is a simpler version accessible first. For 12 I insist we have multiple demos, visualisations etc.

Now we transition to many particles (choose the tensor product).

Then we present Fock space along the lines of my advanced QM course (Bratteli-Robinson plus my extras).

Then we commence the stat mech zoom out based on my Theo C lecture notes.

Then comes thermo.

Then come machines; Carnot.

Then come potentials.

Etc.

At each stage the student learns that every theory is an *effective* theory of the one below it: an approximation to the fundamental underlying physics.

## Rigour

All content *must* be ground-truthed against a local copy of the source tex, pdf, book, etc. No exceptions.

Everything must use the same notation: set up a blessed notation database. We must use consistent definitions: set up the definitions db. Make sure a translation guide is present to work with different sources. Familiarise yourself with ../rk to get a sense of the rigour I am after.

All concepts come with a figure, demo, graphic, example. I aim to have *at least* one picture per page.

Generate ideas, per major concept/lecture, for at least one of: (1) animated interactive demo; (2) game; (3) video.

Our goal right now is to assemble all these requirements into a cohesive plan. Use subagents to scope this out. Use codex exec gpt 6.1 high/xhigh liberally as well. No Fable subagents. This is a large undertaking; I want it clearly planned out.
