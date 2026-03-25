import sys

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Initials
text = text.replace('<a href="#hero" class="nav__logo">HV</a>', '<a href="#hero" class="nav__logo">AS</a>')

# 2. Top Nav
old_nav = """      <div class="nav__links">
        <a href="#work" class="nav__link">Work</a>
        <a href="#rflxns" class="nav__link">RFLXNS</a>
        <a href="#about-hero" class="nav__link">About</a>
        <a href="#philosophy" class="nav__link">Philosophy</a>
        <a href="#contact" class="nav__link">Contact</a>
      </div>"""
new_nav = """      <div class="nav__links">
        <a href="#about-hero" class="nav__link">About</a>
        <a href="#work" class="nav__link">Projects</a>
        <a href="#rflxns" class="nav__link">RFLXNS</a>
        <a href="#capabilities" class="nav__link">Skills &amp; Technologies</a>
        <a href="#certificates" class="nav__link">Certifications &amp; Courses</a>
        <a href="#experience" class="nav__link">Experience</a>
        <a href="#contact" class="nav__link">Contact</a>
      </div>"""
text = text.replace(old_nav, new_nav)

# 3. Console Nav
old_console = """              <ul class="console-list">
                <li><a href="#work" class="console-link"><span class="console-item">Selected Work</span> <span
                      class="console-num">I</span></a></li>
                <li><a href="#rflxns" class="console-link"><span class="console-item">RFLXNS</span> <span
                      class="console-num">II</span></a></li>
                <li><a href="#about-hero" class="console-link"><span class="console-item">About</span> <span
                      class="console-num">III</span></a></li>
                <li><a href="#about" class="console-link"><span class="console-item">Philosophy</span> <span
                      class="console-num">IV</span></a></li>
                <li><a href="#contact" class="console-link"><span class="console-item">Contact</span> <span
                      class="console-num">V</span></a></li>
              </ul>"""
new_console = """              <ul class="console-list">
                <li><a href="#about-hero" class="console-link"><span class="console-item">About</span> <span class="console-num">I</span></a></li>
                <li><a href="#work" class="console-link"><span class="console-item">Projects</span> <span class="console-num">II</span></a></li>
                <li><a href="#rflxns" class="console-link"><span class="console-item">RFLXNS</span> <span class="console-num">III</span></a></li>
                <li><a href="#capabilities" class="console-link"><span class="console-item">Skills &amp; Technologies</span> <span class="console-num">IV</span></a></li>
                <li><a href="#certificates" class="console-link"><span class="console-item">Certifications &amp; Courses</span> <span class="console-num">V</span></a></li>
                <li><a href="#experience" class="console-link"><span class="console-item">Experience</span> <span class="console-num">VI</span></a></li>
                <li><a href="#contact" class="console-link"><span class="console-item">Contact</span> <span class="console-num">VII</span></a></li>
              </ul>"""
text = text.replace(old_console, new_console)

# 4. Remove Philosophy 1 and Update Background
old_phil_1 = """  <!-- ===================== PHILOSOPHY ===================== -->
  <div class="about-divider"></div>

  <section class="about-section">
    <span class="about-section__label about-reveal">I — Philosophy</span>

    <div class="philosophy-grid">
      <div class="philosophy-grid__lead about-reveal">
        Luxury is <em>perception</em> shaped through intention and narrative — not price, not logo, not mass
        appeal.
      </div>
      <div class="philosophy-grid__body">
        <p class="about-reveal">
          I don't believe in creating for the masses. Every project I touch — whether it's a garment, a visual
          system,
          or a piece of software — is built with a specific audience in mind: people who pay attention, who
          value depth
          over trend, authenticity over algorithm.
        </p>
        <p class="about-reveal">
          My approach to creation is rooted in restraint. Scarcity isn't a marketing tactic; it's a design
          principle.
          When something is intentionally limited, it demands more from both creator and consumer. It forces
          you to care.
        </p>
        <p class="about-reveal">
          I treat every medium as a canvas for exploring identity. Garments are reflections of inner states.
          Interfaces
          are architecture for perception. Film is frozen time, coded with meaning. The medium changes. The
          philosophy
          doesn't.
        </p>
      </div>
    </div>
  </section>

  <!-- ===================== BACKGROUND ===================== -->
  <div class="about-divider"></div>

  <section class="about-section about-section--full">
    <span class="about-section__label about-reveal">II — Background</span>"""

new_phil_1 = """  <!-- ===================== BACKGROUND ===================== -->
  <div class="about-divider"></div>

  <section class="about-section about-section--full">
    <span class="about-section__label about-reveal">I — Background</span>"""
text = text.replace(old_phil_1, new_phil_1)

# Update remaining Roman numerals
text = text.replace('III — Ideology', 'II — Ideology')
text = text.replace('IV — Signals', 'III — Signals')

# 5. Rename Selected Work to Projects
text = text.replace('id="work" class="section work">\n    <div class="work__container">\n      <h2 class="section__heading" data-split>Selected Work</h2>',
                    'id="work" class="section work">\n    <div class="work__container">\n      <h2 class="section__heading" data-split>Projects</h2>')
text = text.replace('<!-- ===================== SELECTED WORK ===================== -->', '<!-- ===================== PROJECTS ===================== -->')


# 6. Swap and replace Capabilities -> Skills & Technologies, Achievements -> Experience, Certificates -> Certifications & Courses
old_cap = """  <!-- ===================== CAPABILITIES ===================== -->
  <section id="capabilities" class="section capabilities">
    <h2 class="section__heading" data-split>Capabilities</h2>
    <div class="capabilities__group" data-reveal>
      <h3 class="capabilities__category">Systems</h3>
      <div class="capabilities__badges">
        <span class="badge" data-ag>Python</span>
        <span class="badge" data-ag>Node</span>
        <span class="badge" data-ag>Linux</span>
        <span class="badge" data-ag>macOS</span>
        <span class="badge" data-ag>Containers/VM</span>
        <span class="badge" data-ag>APIs</span>
        <span class="badge" data-ag>Git</span>
      </div>
    </div>
    <div class="capabilities__group" data-reveal>
      <h3 class="capabilities__category">AI &amp; Automation</h3>
      <div class="capabilities__badges">
        <span class="badge" data-ag>Local LLMs</span>
        <span class="badge" data-ag>Prompt systems</span>
        <span class="badge" data-ag>Automation workflows</span>
        <span class="badge" data-ag>Tool integration</span>
      </div>
    </div>
    <div class="capabilities__group" data-reveal>
      <h3 class="capabilities__category">Security</h3>
      <div class="capabilities__badges">
        <span class="badge" data-ag>Kali Linux</span>
        <span class="badge" data-ag>Pentesting tools</span>
        <span class="badge" data-ag>Lab environments</span>
      </div>
    </div>
    <div class="capabilities__group" data-reveal>
      <h3 class="capabilities__category">Creative</h3>
      <div class="capabilities__badges">
        <span class="badge" data-ag>Creative direction</span>
        <span class="badge" data-ag>Brand identity</span>
        <span class="badge" data-ag>Video editing</span>
        <span class="badge" data-ag>Visual storytelling</span>
      </div>
    </div>
  </section>

  <!-- ===================== ACHIEVEMENTS ===================== -->
  <section id="achievements" class="section achievements">
    <h2 class="section__heading" data-split>Achievements</h2>
    <div class="achievements__list">
      <div class="achievements__item" data-reveal>Founded and launched independent high-end streetwear label</div>
      <div class="achievements__item" data-reveal>Built brand identity and physical launch presence</div>
      <div class="achievements__item" data-reveal>Deployed self-hosted AI system on personal hardware</div>
      <div class="achievements__item" data-reveal>Engineered multi-API automation tools</div>
      <div class="achievements__item" data-reveal>Established personal security lab</div>
      <div class="achievements__item" data-reveal>Cross-domain builder — systems + culture + media</div>
    </div>
  </section>

  <!-- ===================== CERTIFICATES ===================== -->
  <section id="certificates" class="section achievements">
    <h2 class="section__heading" data-split>Certificates</h2>
    <div class="achievements__list">
      <div class="achievements__item" data-reveal>Placeholder Certificate 1 — Web Development</div>
      <div class="achievements__item" data-reveal>Placeholder Certificate 2 — AI Systems Engineer</div>
      <div class="achievements__item" data-reveal>Placeholder Certificate 3 — Security Fundamentals</div>
    </div>
  </section>"""

new_cap = """  <!-- ===================== SKILLS & TECHNOLOGIES ===================== -->
  <section id="capabilities" class="section capabilities">
    <h2 class="section__heading" data-split>Skills &amp; Technologies</h2>
    <div class="capabilities__group" data-reveal>
      <h3 class="capabilities__category">Systems</h3>
      <div class="capabilities__badges">
        <span class="badge" data-ag>Python</span>
        <span class="badge" data-ag>Node</span>
        <span class="badge" data-ag>Linux</span>
        <span class="badge" data-ag>macOS</span>
        <span class="badge" data-ag>Containers/VM</span>
        <span class="badge" data-ag>APIs</span>
        <span class="badge" data-ag>Git</span>
      </div>
    </div>
    <div class="capabilities__group" data-reveal>
      <h3 class="capabilities__category">AI &amp; Automation</h3>
      <div class="capabilities__badges">
        <span class="badge" data-ag>Local LLMs</span>
        <span class="badge" data-ag>Prompt systems</span>
        <span class="badge" data-ag>Automation workflows</span>
        <span class="badge" data-ag>Tool integration</span>
      </div>
    </div>
    <div class="capabilities__group" data-reveal>
      <h3 class="capabilities__category">Security</h3>
      <div class="capabilities__badges">
        <span class="badge" data-ag>Kali Linux</span>
        <span class="badge" data-ag>Pentesting tools</span>
        <span class="badge" data-ag>Lab environments</span>
      </div>
    </div>
    <div class="capabilities__group" data-reveal>
      <h3 class="capabilities__category">Creative</h3>
      <div class="capabilities__badges">
        <span class="badge" data-ag>Creative direction</span>
        <span class="badge" data-ag>Brand identity</span>
        <span class="badge" data-ag>Video editing</span>
        <span class="badge" data-ag>Visual storytelling</span>
      </div>
    </div>
  </section>

  <!-- ===================== CERTIFICATIONS & COURSES ===================== -->
  <section id="certificates" class="section achievements">
    <h2 class="section__heading" data-split>Certifications &amp; Courses</h2>
    <div class="achievements__list">
      <div class="achievements__item" data-reveal>Placeholder Certificate 1 — Web Development</div>
      <div class="achievements__item" data-reveal>Placeholder Certificate 2 — AI Systems Engineer</div>
      <div class="achievements__item" data-reveal>Placeholder Certificate 3 — Security Fundamentals</div>
    </div>
  </section>

  <!-- ===================== EXPERIENCE ===================== -->
  <section id="experience" class="section achievements">
    <h2 class="section__heading" data-split>Experience</h2>
    <div class="achievements__list">
      <div class="achievements__item" data-reveal>Founded and launched independent high-end streetwear label</div>
      <div class="achievements__item" data-reveal>Built brand identity and physical launch presence</div>
      <div class="achievements__item" data-reveal>Deployed self-hosted AI system on personal hardware</div>
      <div class="achievements__item" data-reveal>Engineered multi-API automation tools</div>
      <div class="achievements__item" data-reveal>Established personal security lab</div>
      <div class="achievements__item" data-reveal>Cross-domain builder — systems + culture + media</div>
    </div>
  </section>"""
text = text.replace(old_cap, new_cap)

# 7. Remove Philosophy Section 2
old_phil_2 = """  <!-- ===================== PHILOSOPHY ===================== -->
  <section id="philosophy" class="section philosophy">
    <div class="philosophy__content">
      <p class="philosophy__line" data-reveal>I build across systems and culture —</p>
      <p class="philosophy__line" data-reveal>code and clothing, tools and symbols.</p>
      <p class="philosophy__line" data-reveal>My work explores control, identity, and perception</p>
      <p class="philosophy__line" data-reveal>through both software and apparel.</p>
      <p class="philosophy__line philosophy__line--accent" data-reveal>Creation is reflection.</p>
    </div>
  </section>

  <!-- ===================== CONTACT / FOOTER ===================== -->"""

new_phil_2 = """  <!-- ===================== CONTACT / FOOTER ===================== -->"""
text = text.replace(old_phil_2, new_phil_2)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updates applied successfully.")
