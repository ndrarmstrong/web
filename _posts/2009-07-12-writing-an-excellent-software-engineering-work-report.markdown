---
layout: post
published: true
title: Writing an Excellent (Software Engineering) Work Report
---

Writing a work report is something that students in co-op at the University of Waterloo will do a handful of times
throughout their degree.  Unlike the literal interpretation of "work report", for engineers these reports require the
analysis of a situation the student encountered over their work term in order to evaluate their engineering judgment
rather than a blow-by-blow description of what a student did on a particular co-op term. As a report, these milestones
also measure a student's ability to communicate effectively and persuasively, a skill that is just important as knowing
what the correct/best answer is.

Recently, I've been employed to mark some of these work reports for the Software Engineering department, and through
reading and marking these reports I've seen many students struggling to grasp the goals and characteristics of a good
work report. There are detailed guidelines for the writing of these reports (the software engineering guidelines are <a
title="Software Engineering Work Report Guidelines"
href="http://www.softeng.uwaterloo.ca/Current/work_report_guidelines.htm">here</a>), yet many times these guidelines are
misinterpreted or ignored. Some of the guidelines -- primarily formatting and grammar -- generally impact only the
professionalism of a report, while others -- namely the need for clear and accurate analysis -- can result in an
unacceptable work report that no amount of eloquent wording can save. It's a shame to see well written work reports that
show a significant level of effort went into their construction require resubmission because that effort was focused on
the wrong areas.

To combat this, I've put together a list of things to consider when writing an engineering work report, explaining some
of the major areas that students go wrong and my theories on why the guidelines are the way they are.

### Make your problem description explicit

All work reports describe a problem that needs to be solved. Make this problem explicit in your description, don't dance
around it for a few pages and assume your reader will have gathered enough hints to make an educated guess -- if they
guess wrong, the rest of your report makes little sense. Come right out and say it (and explain it afterward if you feel
it necessary).

### Know the difference between criteria, constraints, and requirements

A criterion (N.B: the singular of 'criteria' is 'criterion') is a metric one can use to measure the 'goodness' of a
particular alternative, specifically one that can be used to compare alternatives. Direct measurements like run time,
for instance, make great criteria -- if algorithm X takes twice as long to run as algorithm Y, then it's reasonable to
conclude that Y is twice as good as X (you can also use logarithmic scales). Other items can be used for criteria as
well -- 'feature set' is a common one -- but it is critical that you can objectively compare two alternatives using them.
For instance, using 'feature set' as a criterion and counting up the features of two competing products is not
acceptable -- you need to establish a list of features that you care about in your scenario, and then count how many *of
those features* that each product has.

A constraint establishes the boundaries of the solution space, that is, it identifies which alternatives are worth
considering. A simple example of a constraint is 'the solution must run on Windows'. Unlike a criterion, these are black
and white decisions; they are met, or they are not, there is no range. They are also hard boundaries -- any alternative
that violates a constraint is not a valid alternative and should not be included in the report. It is not strictly
necessary to have constraints, but they are useful to eliminate large numbers of potential alternatives to focus your
report on a specific few.

Some items are both criterion and constraint, though this is something that needs to be clearly identified. An example
of this would be the colour of a new car; blue, green, and grey might be the only acceptable colours (constraint), while
blue was preferred over the others (criterion). You can then use colour as a constraint to eliminate alternatives, as
well as to measure the 'goodness' of the alternatives that remain.

A requirement can be a criterion or a constraint (or a mix of both), so you still need to understand the fundamental
difference between these two concepts. Most of the reports I've seen that take this approach end up confusing themselves
and start measuring alternatives against constraints. I'd recommend against writing your report this way, as the
potential for confusing yourself -- and confusing your reader! -- is pretty high.

### Justify your choice of criteria and their relative importance

Buying a new car based solely on colour is not a good idea, and the same concept applies to work reports: make sure that
the criteria you choose cover all of the important aspects of the area you are investigating, and if there are criteria
that a reasonable reader would expect that you have excluded, explain why they were excluded -- or why the chosen set of
criteria is sufficient to make a defensible conclusion.

Furthermore, if you combine criteria to form a single measure of 'goodness', justify how each of these criteria relate
to each other in importance (to continue the previous example, when buying a car one would expect the 'cost' criterion
to outweigh the 'colour' criterion by a reasonable margin). In some cases, you will have obtained these weights through
some internal process -- for example, you obtained them from the logs of a current environment, or they were given to you
by a manager or collegue; in general, simply explaining how they were obtained ("we performed a series of tests, and
determined the weights should be...") is sufficient. Your readers need evidence that these weights were obtained in a
reasonable fashion and not concocted to favour one particular outcome.

### Alternatives are a requirement

The fundamental act of engineering design is making choices -- and to make a choice, you need a set of alternatives to
choose from. Since the work report is designed to evaluate your engineering judgment, making decisions without
alternatives is unacceptable. The most common occurrence of this is in the 'we did this, and it was good' reports,
reports that basically summarize a student's work term and then tack some numbers on the end to show that what the
student did was good. That's not a decision!

One way to fix this is to choose between 'doing nothing' (e.g. keep the current solution) and a new solution; this
approach still does require you to consider different alternatives if they exist, does not apply to 'synthesis' style
reports (which evaluate *multiple* decisions with a unique set of criteria *and* alternatives for each), and needs to be
presented in such a manner that bias is eliminated (indeed, doing an analysis and finding out that the best alternative
is 'do nothing' is a completely valid result). Having multiple alternatives usually results in a better report (there is
less opportunity for a 'newer is better' bias since most of these reports do not include the 'do nothing' option), but
is not actually necessary -- and even when evaluating many alternatives, 'do nothing' remains a valid alternative in most
scenarios.

### Analysis without (valid) alternatives is useless

As in the previous point, simply discussing a decision, or set of decisions, without presenting alternatives for those
decisions is useless -- it does not show engineering judgment. Further to this, it is important that your alternatives
are actually valid, that your alternatives actually have merit. My grad supervisor tells a story involving two
alternatives a student presented for copying a database table: copy-by-row and copy-by-column. The student correctly
concluded (after some analysis) that copy-by-row was better than copy-by-column, but any person knowledgeable about the
structure and organization of a database would know that trying to copy by column is ludicrous -- it would be orders of
magnitude slower *in all cases* I can think of! Similarly, presenting an O(n!) algorithm as an alternative to an O(n)
and O(n log n) just to ensure you have 3 alternatives is similarly useless; if an alternative is not competitive with
the other alternatives presented, don't include it.

### Analysis without criteria is meaningless

I have read a couple reports that attempted to analyze a set of alternatives without well defined criteria. This usually
results in a discussion of the advantages and disadvantages of each alternative without any real structure for the
analysis: 'Advantages: alternative A is blue, alternative B smells good and is red. Disadvantages: alternative A is
heavy, alternative B is old.' Which one is better, alternative A or B? With the information given, it is impossible to
decide -- we would have to know the relative importance of colour, smell, weight, and age to make any determination at
all; we'd also have to know a scale for each of the values (is blue better than red?) as well as the missing values (the
smell of A was never mentioned). Unless you have a set of well-defined criteria, any analysis you perform is
meaningless.

The 'throw everything against the wall and see what sticks' method is another common result of not having a well defined
criteria; since the author does not know what to talk about specifically, they talk about anything and everything in the
hope that their reader will get the same gut feeling they have for which one is best and therefore accept their
conclusions. Not only is it not a valid form of analysis, but you are just as likely to confuse your reader with random
facts that have no relation to your so-called analysis.

### Analysis without numbers is risky

Though it is not *required* until the the third and fourth work reports, analyzing alternatives quantitatively is one of
the best ways of convincing your reader that what you say is correct -- it is very hard to argue with numbers!
Unfortunately, many software engineering topics do not readily lend themselves to quantitative analysis; measuring the
quality of one product versus another is a difficult task to do numerically. There are ways of doing so -- a
computational decision making strategy, in which qualitative values are converted into quantitative values as the
analysis is performed is one example -- but the best way is to spend time exploring a number of different topics before
settling on one to write your report on. It *is* possible to pass on the basis of qualitative analysis alone, especially
for the earlier work reports, but it takes a lot of work and some sort of formal analysis structure to pull it off (and
a sympathetic marker). I would not recommend it -- if you've found a topic you can only analyze qualitatively, find
another topic.

### Computational decision making strategies are not 'plug 'n chug'

The common response to the 'quantitative analysis' requirement is to turn a report that relies on some qualitative
analysis into a quantitative one by means of a computational decision making strategy. This is a reasonable approach to
introduce both a formal decision making structure and some quantitative data into your report. You cannot do this
willy-nilly, however; you must explain how this transition occurs and justify that the results of this transformation do
not affect the results of your analysis. If you analyze your criteria without using a standardized scale, then
performing a set of operations on the numbers generated for each result has no meaning. If you are incorporating
criteria measured in different units (e.g. 'software quality', a qualtitative value, and 'run time', a quantitative
measurement), they cannot be combined directly until all measured values are converted to a unitless values through a
process you define and justify. If you do not justify the weights with which you combine criteria, the result is
meaningless. If you discuss each criteria without comparing the alternatives and generating a number, and instead just
tack on a decision making chart at the end, the result is meaningless.

Using a computational decision making strategy can work really well -- but your reader needs to be able to have
visibility into how each metric was obtained and how the results were combined for the results to be valid. Simply
plugging numbers that were pulled out of thin air into a table does not show analysis nor automatically 'work'; you need
to justify your use of such a process.

### Be precise in your wording

The hallmark of a great technical report is that each claim it makes can be independently and scientifically verified.
In a work report, students are not held to the same standards as researchers are -- statistical significance, error bars,
and sensitivity analysis would improve the rigor of a report, but are not necessary -- but it is still important that
everything you say is technically correct and unambiguous. Phrases like 'the process should complete in a reasonable
amount of time' are precisely the opposite; as a reader, I have no idea what 'reasonable' means in this context. Without
a measurable quantity, I cannot tell whether this constraint is met, regardless of the quality of the analysis.

In addition, be aware of the 'slightly pregnant/mostly dead' trap. Pregnancy and death are absolutes; one cannot be
slightly pregnant or mostly dead, one is or one is not pregnant/dead. While these topics (pregnancy/death) tend not to
appear in technical reports, there are plenty of quantities that are similarly absolute and should not be accompanied
with a modifier.

### Avoid making claims without data

Stating that 'it is your belief that...' or 'it is the belief of the development team that...' are not valid technical
conclusions. Faith is not a substitute for scientific data in a technical report; I cannot independently reproduce or
verify belief-based statements. If a statement cannot be verified, then it carries no weight in a technical report.
Present data to support your claim, reference an external source, or do not make the claim.

### Implementation details are unnecessary

I hope by this point that you have realized that the purpose of the work report is the engineering analysis it contains.
Including details on how a particular solution was built usually is not necessary for the reader to understand your
analysis, and thus is not important (a big hint: if you start writing a section after analyzing your alternatives an
selecting the best one, stop writing. You don't need it.). While it is unlikely that you will lose marks for including
implementation details, including these details takes space that could be used for analysis instead (remember the
20-page main body limit). If the analysis you do in the space you have isn't sufficient for credit, then you will not
pass the report even if your implementation section is perfectly written -- it just does not matter.

### Define your terms, and have a glossary

Every time you introduce a term that might be unfamiliar to your reader -- who could be in a completely different segment
of software engineering than you -- be sure to define it and place it in a glossary. It is really easy to write a report
for your co-workers that assume knowledge of certain internal systems, but your reader almost certainly will not have
the same knowledge. Without these definitions, it can be incredibly difficult to figure out what it is you are talking
about.

Furthermore, once you've defined a term, stick to it. If it is AJAX when you define it, stick to it -- don't start
calling it Asynchronous Javascript And XML halfway through the report, or start calling it by the name of the framework
you're using to accomplish it. Choose whatever works best for your report, and use it throughout.

### Follow the guidelines

This one should be obvious, but the most important advice I can provide is that you should follow the guidelines. They
are very explicit in every aspect of what a work report should contain, where it should contain it, and how it should be
formatted. It's a shame to lose marks for not formatting your headings right, placing table citations under instead of
above the table, not including your conclusions and recommendations in the executive summary, introducing new data in
the conclusion or recommendations sections, making conclusions or recommendations that are not supported by the body of
the report, etc. Before you submit, be sure to read through the guidelines and make sure that you are following them
all, and have a friend proofread your report for spelling and grammar. It's a shame to lose marks for a lack of
professionalism when most of the items listed in the guidelines are really easy to fix.

## In Conclusion...

... writing a work report is not an incredibly arduous task, and the markers are not out to get you. As long as you keep
in mind that you need to be clear and precise in your writing, need to include alternatives, demonstrate engineering
judgment by analyzing a situation using an established set of criteria, you'll do fine. Without showing that judgment,
however, you will find yourself resubmitting your report in pretty short order.
