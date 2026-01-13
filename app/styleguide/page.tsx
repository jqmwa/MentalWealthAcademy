'use client';

import React from 'react';
import styles from './page.module.css';
import {
  colors,
  gradients,
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacing,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  durations,
  easings,
  zIndex,
} from '@/styles/design-tokens';

/**
 * Mental Wealth Academy Style Guide
 * Visual reference for all design tokens
 */
export default function StyleGuidePage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Design System</h1>
          <p className={styles.subtitle}>
            Mental Wealth Academy — Visual reference for design tokens and components
          </p>
        </header>

        {/* Colors Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🎨 Colors</h2>
          <p className={styles.sectionDescription}>
            Our color palette is rooted in knowledge, community, and transparency. 
            Academy Blue signals trust and primary actions, while Growth Green signals progress and achievements.
          </p>

          {/* Primary Colors */}
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Primary Colors</h3>
            <div className={styles.colorGrid}>
              <ColorCard name="Primary" value={colors.primary.DEFAULT} />
              <ColorCard name="Primary Hover" value={colors.primary.hover} />
              <ColorCard name="Primary Light" value={colors.primary.light} />
              <ColorCard name="Secondary" value={colors.secondary.DEFAULT} />
              <ColorCard name="Secondary Hover" value={colors.secondary.hover} />
              <ColorCard name="Secondary Light" value={colors.secondary.light} />
            </div>
          </div>

          {/* Background Colors */}
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Background Colors</h3>
            <div className={styles.colorGrid}>
              <ColorCard name="Background" value={colors.background.DEFAULT} />
              <ColorCard name="Card" value="#FFFFFF" />
              <ColorCard name="Dark Background" value={colors.background.dark} />
              <ColorCard name="Dark Card" value={colors.background.cardDark} />
            </div>
          </div>

          {/* Neutral Colors */}
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Neutral Scale</h3>
            <div className={styles.colorGrid}>
              <ColorCard name="White" value={colors.neutrals.white} />
              <ColorCard name="Gray 50" value={colors.neutrals[50]} />
              <ColorCard name="Gray 100" value={colors.neutrals[100]} />
              <ColorCard name="Gray 200" value={colors.neutrals[200]} />
              <ColorCard name="Gray 300" value={colors.neutrals[300]} />
              <ColorCard name="Gray 400" value={colors.neutrals[400]} />
              <ColorCard name="Gray 500" value={colors.neutrals[500]} />
              <ColorCard name="Gray 600" value={colors.neutrals[600]} />
              <ColorCard name="Gray 700" value={colors.neutrals[700]} />
              <ColorCard name="Gray 800" value={colors.neutrals[800]} />
              <ColorCard name="Gray 900" value={colors.neutrals[900]} />
              <ColorCard name="Black" value={colors.neutrals.black} />
            </div>
          </div>

          {/* Semantic Colors */}
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Semantic Colors</h3>
            <div className={styles.colorGrid}>
              <ColorCard name="Success" value={colors.semantic.success.DEFAULT} />
              <ColorCard name="Success Light" value={colors.semantic.success.light} />
              <ColorCard name="Warning" value={colors.semantic.warning.DEFAULT} />
              <ColorCard name="Warning Light" value={colors.semantic.warning.light} />
              <ColorCard name="Error" value={colors.semantic.error.DEFAULT} />
              <ColorCard name="Error Light" value={colors.semantic.error.light} />
              <ColorCard name="Info" value={colors.semantic.info.DEFAULT} />
              <ColorCard name="Info Light" value={colors.semantic.info.light} />
            </div>
          </div>

          {/* Category Colors */}
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Category Colors</h3>
            <div className={styles.colorGrid}>
              <ColorCard name="Mental Health" value={colors.category.mentalHealth} />
              <ColorCard name="Productivity" value={colors.category.productivity} />
              <ColorCard name="Wealth" value={colors.category.wealth} />
            </div>
          </div>
        </section>

        {/* Gradients Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🌈 Gradients</h2>
          <p className={styles.sectionDescription}>
            Subtle gradients for hero sections, featured content, and depth effects.
          </p>
          <div className={styles.gradientGrid}>
            <GradientCard 
              name="Futuristic Floss" 
              value={gradients.futuristicFloss}
              description="Hero sections, featured content"
            />
            <GradientCard 
              name="Primary Gradient" 
              value={gradients.primary}
              description="Primary action emphasis"
            />
            <GradientCard 
              name="Secondary Gradient" 
              value={gradients.secondary}
              description="Progress and achievement"
            />
            <GradientCard 
              name="Swipe Like" 
              value={gradients.swipeLike}
              description="Positive swipe actions"
            />
            <GradientCard 
              name="Swipe Skip" 
              value={gradients.swipeSkip}
              description="Negative swipe actions"
            />
            <GradientCard 
              name="Swipe Save" 
              value={gradients.swipeSave}
              description="Save/bookmark actions"
            />
          </div>
        </section>

        {/* Typography Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>✏️ Typography</h2>
          <p className={styles.sectionDescription}>
            Typography sets the tone for knowledge transfer and community trust.
            Space Grotesk for headlines, Poppins for body text, IBM Plex Mono for buttons and technical data.
          </p>

          {/* Font Families */}
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Font Families</h3>
            <div className={styles.fontFamilyGrid}>
              <div className={styles.fontFamilyCard}>
                <div className={styles.fontFamilyName} style={{ fontFamily: fontFamilies.primary }}>
                  Poppins
                </div>
                <div className={styles.fontFamilyUsage}>Primary — Body Text</div>
                <div className={styles.fontFamilySample} style={{ fontFamily: fontFamilies.primary, fontWeight: 300 }}>
                  The quick brown fox jumps over the lazy dog.
                </div>
                <div className={styles.fontWeightsRow}>
                  <span className={styles.fontWeightChip} style={{ fontFamily: fontFamilies.primary, fontWeight: 300 }}>Light 300</span>
                  <span className={styles.fontWeightChip} style={{ fontFamily: fontFamilies.primary, fontWeight: 400 }}>Regular 400</span>
                  <span className={styles.fontWeightChip} style={{ fontFamily: fontFamilies.primary, fontWeight: 500 }}>Medium 500</span>
                  <span className={styles.fontWeightChip} style={{ fontFamily: fontFamilies.primary, fontWeight: 600 }}>Semibold 600</span>
                  <span className={styles.fontWeightChip} style={{ fontFamily: fontFamilies.primary, fontWeight: 700 }}>Bold 700</span>
                </div>
              </div>
              <div className={styles.fontFamilyCard}>
                <div className={styles.fontFamilyName} style={{ fontFamily: fontFamilies.secondary }}>
                  Space Grotesk
                </div>
                <div className={styles.fontFamilyUsage}>Secondary — Headlines, Navigation</div>
                <div className={styles.fontFamilySample} style={{ fontFamily: fontFamilies.secondary }}>
                  The quick brown fox jumps over the lazy dog.
                </div>
                <div className={styles.fontWeightsRow}>
                  <span className={styles.fontWeightChip} style={{ fontFamily: fontFamilies.secondary, fontWeight: 400 }}>Regular 400</span>
                  <span className={styles.fontWeightChip} style={{ fontFamily: fontFamilies.secondary, fontWeight: 500 }}>Medium 500</span>
                  <span className={styles.fontWeightChip} style={{ fontFamily: fontFamilies.secondary, fontWeight: 600 }}>Semibold 600</span>
                  <span className={styles.fontWeightChip} style={{ fontFamily: fontFamilies.secondary, fontWeight: 700 }}>Bold 700</span>
                </div>
              </div>
              <div className={styles.fontFamilyCard}>
                <div className={styles.fontFamilyName} style={{ fontFamily: fontFamilies.mono }}>
                  IBM Plex Mono
                </div>
                <div className={styles.fontFamilyUsage}>Mono — Buttons, Code, Technical Data</div>
                <div className={styles.fontFamilySample} style={{ fontFamily: fontFamilies.mono }}>
                  0x1234...5678 | $42,069.00
                </div>
                <div className={styles.fontWeightsRow}>
                  <span className={styles.fontWeightChip} style={{ fontFamily: fontFamilies.mono, fontWeight: 400 }}>Regular 400</span>
                  <span className={styles.fontWeightChip} style={{ fontFamily: fontFamilies.mono, fontWeight: 500 }}>Medium 500</span>
                  <span className={styles.fontWeightChip} style={{ fontFamily: fontFamilies.mono, fontWeight: 600 }}>Semibold 600</span>
                  <span className={styles.fontWeightChip} style={{ fontFamily: fontFamilies.mono, fontWeight: 700 }}>Bold 700</span>
                </div>
              </div>
            </div>
          </div>

          {/* Type Scale */}
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Type Scale</h3>
            <div className={styles.typographyGrid}>
              <TypographySample 
                label="H1 — Hero Headlines" 
                text="Mental Wealth Academy" 
                style={{ ...typography.h1, fontSize: fontSizes['3xl'] }}
                meta={`${fontSizes['3xl']} / Bold / Space Grotesk`}
              />
              <TypographySample 
                label="H2 — Page Titles" 
                text="Building Transparent Futures" 
                style={{ ...typography.h2, fontSize: fontSizes['2xl'] }}
                meta={`${fontSizes['2xl']} / Semibold / Space Grotesk`}
              />
              <TypographySample 
                label="H3 — Section Headers" 
                text="Education That Empowers" 
                style={{ ...typography.h3, fontSize: fontSizes.xl }}
                meta={`${fontSizes.xl} / Semibold / Space Grotesk`}
              />
              <TypographySample 
                label="H4 — Subheadings" 
                text="Community Governance" 
                style={{ ...typography.h4, fontSize: fontSizes.lg }}
                meta={`${fontSizes.lg} / Semibold / Space Grotesk`}
              />
              <TypographySample 
                label="Body — Primary Text" 
                text="Our design is educational, community-centered, transparent, accessible, empowering, collaborative, and forward-thinking." 
                style={{ ...typography.body, fontSize: fontSizes.base }}
                meta={`${fontSizes.base} / Light / Poppins`}
              />
              <TypographySample 
                label="Body Large — Featured Text" 
                text="Knowledge for all, together. Growing stronger by empowering your community." 
                style={{ ...typography.bodyLarge, fontSize: fontSizes.md }}
                meta={`${fontSizes.md} / Light / Poppins`}
              />
              <TypographySample 
                label="Caption — Metadata" 
                text="Last updated 2 hours ago • 1.2k views • 48 comments" 
                style={{ ...typography.caption, fontSize: fontSizes.xs }}
                meta={`${fontSizes.xs} / Regular / Poppins`}
              />
              <TypographySample 
                label="Button — Actions" 
                text="CONNECT WALLET" 
                style={{ ...typography.button, fontSize: fontSizes.base }}
                meta={`${fontSizes.base} / Medium / IBM Plex Mono / Uppercase`}
              />
              <TypographySample 
                label="Mono — Technical Data" 
                text="0x1234...5678 | Block #18,942,156" 
                style={{ ...typography.mono, fontSize: fontSizes.base }}
                meta={`${fontSizes.base} / Regular / IBM Plex Mono / Tabular Nums`}
              />
            </div>
          </div>
        </section>

        {/* Spacing Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📏 Spacing Scale</h2>
          <p className={styles.sectionDescription}>
            All spacing uses a 4px base grid for precision and rhythm. Compatible with Tailwind spacing utilities.
          </p>
          <div className={styles.spacingGrid}>
            {[
              { key: '1', value: spacing[1], px: '4px' },
              { key: '2', value: spacing[2], px: '8px' },
              { key: '3', value: spacing[3], px: '12px' },
              { key: '4', value: spacing[4], px: '16px' },
              { key: '5', value: spacing[5], px: '20px' },
              { key: '6', value: spacing[6], px: '24px' },
              { key: '8', value: spacing[8], px: '32px' },
              { key: '10', value: spacing[10], px: '40px' },
              { key: '12', value: spacing[12], px: '48px' },
              { key: '16', value: spacing[16], px: '64px' },
              { key: '20', value: spacing[20], px: '80px' },
              { key: '24', value: spacing[24], px: '96px' },
            ].map((s) => (
              <div key={s.key} className={styles.spacingRow}>
                <span className={styles.spacingLabel}>{s.key}</span>
                <div 
                  className={styles.spacingBar} 
                  style={{ width: `calc(${s.value} * 3)` }}
                >
                  <span className={styles.spacingValue}>{s.px}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Border Radius Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔲 Border Radius</h2>
          <p className={styles.sectionDescription}>
            Soft corners to balance technical precision with approachability. Stick to the 4px grid.
          </p>
          <div className={styles.radiusGrid}>
            {Object.entries(borderRadius).map(([key, value]) => (
              <div key={key} className={styles.radiusCard} style={{ borderRadius: value }}>
                <div 
                  className={styles.radiusSample} 
                  style={{ borderRadius: value }}
                />
                <span className={styles.radiusLabel}>{key}</span>
                <span className={styles.radiusValue}>{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Shadows Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🌓 Shadows</h2>
          <p className={styles.sectionDescription}>
            Subtle single shadows with border reinforcement. The craft is in the choice, not the complexity.
          </p>
          <div className={styles.shadowGrid}>
            {[
              { name: 'None', value: shadows.none },
              { name: 'Small', value: shadows.sm },
              { name: 'Default', value: shadows.DEFAULT },
              { name: 'Medium', value: shadows.md },
              { name: 'Large', value: shadows.lg },
              { name: 'Extra Large', value: shadows.xl },
              { name: 'Primary', value: shadows.primary },
              { name: 'Card', value: shadows.card },
              { name: 'Card Hover', value: shadows.cardHover },
            ].map((shadow) => (
              <div 
                key={shadow.name} 
                className={styles.shadowCard}
                style={{ boxShadow: shadow.value }}
              >
                <span className={styles.shadowLabel}>{shadow.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Breakpoints Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📱 Breakpoints</h2>
          <p className={styles.sectionDescription}>
            Mobile-first responsive design breakpoints. Design for the smallest screen first.
          </p>
          <div className={styles.breakpointGrid}>
            {[
              { name: 'xs', value: breakpoints.xs, device: 'Small phones', percent: 20 },
              { name: 'sm', value: breakpoints.sm, device: 'Large phones', percent: 30 },
              { name: 'md', value: breakpoints.md, device: 'Tablets', percent: 50 },
              { name: 'lg', value: breakpoints.lg, device: 'Laptops', percent: 67 },
              { name: 'xl', value: breakpoints.xl, device: 'Desktops', percent: 83 },
              { name: '2xl', value: breakpoints['2xl'], device: 'Large desktops', percent: 100 },
            ].map((bp) => (
              <div key={bp.name} className={styles.breakpointRow}>
                <span className={styles.breakpointName}>{bp.name}</span>
                <span className={styles.breakpointValue}>{bp.value}</span>
                <div className={styles.breakpointBar}>
                  <div 
                    className={styles.breakpointFill}
                    style={{ width: `${bp.percent}%` }}
                  />
                </div>
                <span className={styles.breakpointDevice}>{bp.device}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Animation Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⚡ Animation</h2>
          <p className={styles.sectionDescription}>
            Smooth, decisive animations that respect user focus. No spring/bouncy effects in enterprise UI.
          </p>

          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Durations</h3>
            <div className={styles.animationGrid}>
              {Object.entries(durations).map(([key, value]) => (
                <div key={key} className={styles.animationCard}>
                  <div 
                    className={styles.animationBox}
                    style={{ transition: `transform ${value} ease` }}
                  />
                  <span className={styles.animationLabel}>{key}</span>
                  <span className={styles.animationValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Easing Curves</h3>
            <div className={styles.animationGrid}>
              {Object.entries(easings).map(([key, value]) => (
                <div key={key} className={styles.animationCard}>
                  <div 
                    className={styles.animationBox}
                    style={{ transition: `transform 300ms ${value}` }}
                  />
                  <span className={styles.animationLabel}>{key}</span>
                  <span className={styles.animationValue} style={{ fontSize: '0.5rem' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Z-Index Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📚 Z-Index Scale</h2>
          <p className={styles.sectionDescription}>
            Layering system for managing stacking contexts consistently across components.
          </p>
          <div className={styles.zIndexGrid}>
            {Object.entries(zIndex)
              .filter(([, value]) => typeof value === 'number')
              .sort(([, a], [, b]) => (a as number) - (b as number))
              .map(([key, value]) => (
                <div key={key} className={styles.zIndexRow}>
                  <span className={styles.zIndexLabel}>{key}</span>
                  <span className={styles.zIndexValue}>{value}</span>
                </div>
              ))}
          </div>
        </section>

        {/* Buttons Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔘 Buttons</h2>
          <p className={styles.sectionDescription}>
            All buttons use IBM Plex Mono font with uppercase text and 0.05em letter-spacing.
          </p>
          <div className={styles.buttonGrid}>
            <button className={styles.buttonPrimary}>Primary Button</button>
            <button className={styles.buttonSecondary}>Secondary Button</button>
            <button className={styles.buttonOutline}>Outline Button</button>
            <button className={styles.buttonDark}>Dark Button</button>
          </div>
        </section>

        {/* Cards Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🃏 Cards</h2>
          <p className={styles.sectionDescription}>
            Card layouts vary, but surface treatment stays consistent. Each card type shares the same border radius, shadow depth, padding scale, and typography system.
          </p>
          <div className={styles.cardGrid}>
            <div className={`${styles.exampleCard} ${styles.cardMentalHealth}`}>
              <div className={styles.cardCategory} style={{ color: colors.category.mentalHealth }}>
                Mental Health
              </div>
              <div className={styles.cardTitle}>Cyber-Psychology Fundamentals</div>
              <div className={styles.cardDescription}>
                Understanding the psychological impact of digital environments on mental wellness.
              </div>
            </div>
            <div className={`${styles.exampleCard} ${styles.cardProductivity}`}>
              <div className={styles.cardCategory} style={{ color: colors.category.productivity }}>
                Productivity
              </div>
              <div className={styles.cardTitle}>Deep Work Workshop</div>
              <div className={styles.cardDescription}>
                Master the art of focused work in an age of constant distraction.
              </div>
            </div>
            <div className={`${styles.exampleCard} ${styles.cardWealth}`}>
              <div className={styles.cardCategory} style={{ color: colors.category.wealth }}>
                Wealth
              </div>
              <div className={styles.cardTitle}>Treasury Governance</div>
              <div className={styles.cardDescription}>
                Participate in community-driven financial decisions and proposals.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================
// Helper Components
// ============================================

function ColorCard({ name, value }: { name: string; value: string }) {
  const isLight = isLightColor(value);
  
  return (
    <div className={styles.colorCard}>
      <div 
        className={styles.colorSwatch} 
        style={{ 
          backgroundColor: value,
          border: isLight ? '1px solid rgba(0,0,0,0.08)' : 'none'
        }} 
      />
      <div className={styles.colorInfo}>
        <div className={styles.colorName}>{name}</div>
        <div className={styles.colorValue}>{value}</div>
      </div>
    </div>
  );
}

function GradientCard({ name, value, description }: { name: string; value: string; description: string }) {
  return (
    <div className={styles.gradientCard}>
      <div 
        className={styles.gradientSwatch} 
        style={{ background: value }} 
      />
      <div className={styles.gradientInfo}>
        <div className={styles.gradientName}>{name}</div>
        <div className={styles.gradientValue}>{description}</div>
      </div>
    </div>
  );
}

function TypographySample({ 
  label, 
  text, 
  style, 
  meta 
}: { 
  label: string; 
  text: string; 
  style: React.CSSProperties; 
  meta: string;
}) {
  return (
    <div className={styles.typographySample}>
      <div className={styles.typographyLabel}>{label}</div>
      <div className={styles.typographyText} style={style}>{text}</div>
      <div className={styles.typographyMeta}>{meta}</div>
    </div>
  );
}

// Helper function to determine if a color is light
function isLightColor(color: string): boolean {
  // Handle rgba colors
  if (color.startsWith('rgba')) return true;
  
  // Handle hex colors
  const hex = color.replace('#', '');
  if (hex.length !== 6) return false;
  
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.7;
}
