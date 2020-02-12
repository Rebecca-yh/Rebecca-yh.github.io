---
layout: post
title:  "Adversarial Search and Game Trees"
date:   2019-3-1 01:00:00
excerpt: "In game theory and economic theory, a zero-sum game is a mathematical representation of a situation in which each participant's gain or loss of utility is exactly balanced by the losses or gains of the utility of the other participants..."
categories: AI
tags: search
image:
  feature: QQ20190301-212917@2x.png
  topPosition: -100px
bgContrast: dark
bgGradientOpacity: darker
syntaxHighlighter: no
---

![image](/tmp/QQ20190301-213523@2x.png){:height="600px" width="650px"}

<h2>Deterministic Games</h2>
<p><strong>Many possible formalizations, one is:</strong></p>
<p>States: S (start at s0)</p>
<p>Players: P={1...N} (usually take turns)</p>
<p>Actions: A (may depend on player / state)</p>
<p>Transition Function: SxA ➡ S</p>
<p>Terminal Test: S ➡ {t,f}</p>
<p>Terminal Utilities: SxP ➡ R</p>
<p><strong>Solution for a player is a policy:
S ➡ A</strong></p>
<h2>Zero-Sum Games</h2>
<p>Agents have opposite utilities (values on outcomes)
Lets us think of a single value that one maximizes and the other minimizes
Adversarial, pure competition</p>
<h2>Adversarial Search</h2>
![image](/tmp/图片 1.png){:height="600px" width="650px"}

<p>You, as an agent, have to think about as a function of what you do, what will the other agents do who is working against you. What opportunities will you then see after that, what will they see after that.
And keep thinking &quot;what if, if, if...&quot;</p>
<h3>Single-Agent Trees</h3>
![image](/tmp/AEEAD992-FD0B-4AE1-9AE4-A9A2B048A9D2.png){:height="300px" width="700px"}
<p>&nbsp;</p>
<p>In these game scenarios, with each terminal state, we associate a utility.
minus 1 for every time step spent, every action taken,plus 10 for every pellet eaten.</p>
<h3>Adversarial Game Trees</h3>
![image](/tmp/0FFF153C-BE8F-4C74-ABA6-C44896C45E32.png){:height="300px" width="700px"}
<p>&nbsp;</p>
<p>Ghost would prefer to have the lowest possible outcome. So
States Under Opponent’s Control, we have a minimization happening of the utility.</p>
<h3>Minimax Implementation</h3>
<p><strong>Deterministic, zero-sum games:</strong></p>
<ul>
<li>Tic-tac-toe, chess, checkers</li>
<li>One player maximizes result</li>
<li>The other minimizes result</li>

</ul>
<p><strong>Minimax search:</strong></p>
<ul>
<li>A state-space search tree</li>
<li>Players alternate turns</li>
<li>Compute each node’s minimax value: the best achievable utility against a rational (optimal) adversary</li>

</ul>
![image](/tmp/1F2BEF61-1ED9-4876-AA6E-CFC193AB8EF3.png){:height="300px" width="700px"}

<h3>Minimax Properties</h3>
<p><strong>Optimal against a perfect player.  Otherwise?</strong>
我们在计算的过程中认为对手是完美的，实际上不然。我们在搜索树中（计算极小值时）选取对他们最有利的节点，没有考虑到他们“犯错”的可能，可能让我们失去赢的机会。</p>
<h3>Minimax Efficiency</h3>
<p>How efficient is minimax?</p>
<p>Just like (exhaustive) DFS</p>
<p>Time: O(bm)</p>
<p>Space: O(bm)</p>
<p>&nbsp;</p>
<p><strong>未完待续</strong></p>
<p>&nbsp;</p>


