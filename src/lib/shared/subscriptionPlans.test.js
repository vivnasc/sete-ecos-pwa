import { describe, it, expect, vi } from 'vitest'

// Mock supabase to avoid requiring env vars at import time
vi.mock('../supabase', () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({}) }) }) }),
  },
}))

import {
  ECO_PLANS,
  BUNDLE_PLANS,
  SUBSCRIPTION_STATUS,
  GLOBAL_CONFIG,
  getEcoPlans,
  getEcoTheme,
  calculateBundlePrice,
} from './subscriptionPlans.js'

// ===== ECO_PLANS structure =====

describe('ECO_PLANS', () => {
  const allEcos = Object.keys(ECO_PLANS)

  it('contains all 8 ecos', () => {
    expect(allEcos).toEqual(
      expect.arrayContaining(['vitalis', 'aurea', 'serena', 'ignis', 'ventis', 'ecoa', 'imago', 'aurora'])
    )
    expect(allEcos.length).toBe(8)
  })

  it('every eco has name, table, and color fields', () => {
    allEcos.forEach((eco) => {
      const config = ECO_PLANS[eco]
      expect(config.name).toBeDefined()
      expect(typeof config.name).toBe('string')
      expect(config.table).toBeDefined()
      expect(typeof config.table).toBe('string')
      expect(config.color).toBeDefined()
      expect(typeof config.color).toBe('string')
    })
  })

  it('non-aurora ecos have monthly, semestral, and annual pricing', () => {
    const paidEcos = allEcos.filter((e) => e !== 'aurora')
    paidEcos.forEach((eco) => {
      const config = ECO_PLANS[eco]
      expect(config.monthly).toBeDefined()
      expect(config.semestral).toBeDefined()
      expect(config.annual).toBeDefined()

      // Each plan has required fields
      ;['monthly', 'semestral', 'annual'].forEach((period) => {
        const plan = config[period]
        expect(plan.id).toBe(period)
        expect(typeof plan.name).toBe('string')
        expect(typeof plan.duration).toBe('number')
        expect(typeof plan.price_mzn).toBe('number')
        expect(typeof plan.price_usd).toBe('number')
        expect(typeof plan.discount).toBe('number')
        expect(plan.price_mzn).toBeGreaterThan(0)
        expect(plan.price_usd).toBeGreaterThan(0)
      })
    })
  })

  it('aurora is marked as free and has no pricing plans', () => {
    const aurora = ECO_PLANS.aurora
    expect(aurora.free).toBe(true)
    expect(aurora.monthly).toBeUndefined()
    expect(aurora.semestral).toBeUndefined()
    expect(aurora.annual).toBeUndefined()
  })

  it('semestral and annual plans have savings_mzn for non-aurora ecos', () => {
    const paidEcos = allEcos.filter((e) => e !== 'aurora')
    paidEcos.forEach((eco) => {
      const config = ECO_PLANS[eco]
      expect(config.semestral.savings_mzn).toBeGreaterThan(0)
      expect(config.annual.savings_mzn).toBeGreaterThan(0)
    })
  })

  it('semestral and annual plans have non-zero discounts', () => {
    const paidEcos = allEcos.filter((e) => e !== 'aurora')
    paidEcos.forEach((eco) => {
      const config = ECO_PLANS[eco]
      expect(config.monthly.discount).toBe(0)
      expect(config.semestral.discount).toBeGreaterThan(0)
      expect(config.annual.discount).toBeGreaterThan(config.semestral.discount)
    })
  })

  it('vitalis has the correct specific prices', () => {
    const v = ECO_PLANS.vitalis
    expect(v.monthly.price_mzn).toBe(2500)
    expect(v.semestral.price_mzn).toBe(12500)
    expect(v.annual.price_mzn).toBe(21000)
  })

  it('aurea has the correct specific prices', () => {
    const a = ECO_PLANS.aurea
    expect(a.monthly.price_mzn).toBe(975)
    expect(a.semestral.price_mzn).toBe(5265)
    expect(a.annual.price_mzn).toBe(9945)
  })
})

// ===== BUNDLE_PLANS structure =====

describe('BUNDLE_PLANS', () => {
  it('has duo, trio, jornada, tudo bundles', () => {
    expect(Object.keys(BUNDLE_PLANS)).toEqual(['duo', 'trio', 'jornada', 'tudo'])
  })

  it('duo has minEcos 2, maxEcos 2', () => {
    expect(BUNDLE_PLANS.duo.minEcos).toBe(2)
    expect(BUNDLE_PLANS.duo.maxEcos).toBe(2)
  })

  it('trio has minEcos 3, maxEcos 3', () => {
    expect(BUNDLE_PLANS.trio.minEcos).toBe(3)
    expect(BUNDLE_PLANS.trio.maxEcos).toBe(3)
  })

  it('jornada has minEcos 5, maxEcos 7', () => {
    expect(BUNDLE_PLANS.jornada.minEcos).toBe(5)
    expect(BUNDLE_PLANS.jornada.maxEcos).toBe(7)
  })

  it('tudo has minEcos 7, maxEcos 7', () => {
    expect(BUNDLE_PLANS.tudo.minEcos).toBe(7)
    expect(BUNDLE_PLANS.tudo.maxEcos).toBe(7)
  })

  it('every bundle has monthly, semestral, annual with price_mzn and price_usd', () => {
    Object.values(BUNDLE_PLANS).forEach((bundle) => {
      ;['monthly', 'semestral', 'annual'].forEach((period) => {
        expect(bundle[period]).toBeDefined()
        expect(typeof bundle[period].price_mzn).toBe('number')
        expect(typeof bundle[period].price_usd).toBe('number')
        expect(bundle[period].price_mzn).toBeGreaterThan(0)
        expect(bundle[period].price_usd).toBeGreaterThan(0)
      })
    })
  })

  it('every bundle has id, name, description, and discount', () => {
    Object.entries(BUNDLE_PLANS).forEach(([key, bundle]) => {
      expect(bundle.id).toBe(key)
      expect(typeof bundle.name).toBe('string')
      expect(typeof bundle.description).toBe('string')
      expect(typeof bundle.discount).toBe('number')
      expect(bundle.discount).toBeGreaterThan(0)
    })
  })

  it('discount increases with more ecos', () => {
    expect(BUNDLE_PLANS.duo.discount).toBeLessThan(BUNDLE_PLANS.trio.discount)
    expect(BUNDLE_PLANS.trio.discount).toBeLessThan(BUNDLE_PLANS.jornada.discount)
    expect(BUNDLE_PLANS.jornada.discount).toBeLessThan(BUNDLE_PLANS.tudo.discount)
  })
})

// ===== SUBSCRIPTION_STATUS =====

describe('SUBSCRIPTION_STATUS', () => {
  it('has all expected statuses', () => {
    expect(SUBSCRIPTION_STATUS.TESTER).toBe('tester')
    expect(SUBSCRIPTION_STATUS.TRIAL).toBe('trial')
    expect(SUBSCRIPTION_STATUS.ACTIVE).toBe('active')
    expect(SUBSCRIPTION_STATUS.PENDING).toBe('pending')
    expect(SUBSCRIPTION_STATUS.EXPIRED).toBe('expired')
    expect(SUBSCRIPTION_STATUS.CANCELLED).toBe('cancelled')
    expect(SUBSCRIPTION_STATUS.NONE).toBeNull()
  })
})

// ===== GLOBAL_CONFIG =====

describe('GLOBAL_CONFIG', () => {
  it('has 7-day trial', () => {
    expect(GLOBAL_CONFIG.TRIAL_DAYS).toBe(7)
  })

  it('has currency codes', () => {
    expect(GLOBAL_CONFIG.CURRENCY_MZN).toBe('MZN')
    expect(GLOBAL_CONFIG.CURRENCY_USD).toBe('USD')
  })
})

// ===== getEcoPlans() =====

describe('getEcoPlans', () => {
  it('returns array of 3 plans for vitalis', () => {
    const plans = getEcoPlans('vitalis')
    expect(plans).toHaveLength(3)
    expect(plans[0].id).toBe('monthly')
    expect(plans[1].id).toBe('semestral')
    expect(plans[2].id).toBe('annual')
  })

  it('returns array of 3 plans for aurea', () => {
    const plans = getEcoPlans('aurea')
    expect(plans).toHaveLength(3)
    expect(plans[0].price_mzn).toBe(975)
  })

  it('returns array of 3 plans for serena', () => {
    const plans = getEcoPlans('serena')
    expect(plans).toHaveLength(3)
  })

  it('returns empty array for aurora (free eco, no pricing plans)', () => {
    const plans = getEcoPlans('aurora')
    expect(plans).toEqual([])
  })

  it('returns empty array for invalid eco name', () => {
    expect(getEcoPlans('nonexistent')).toEqual([])
  })

  it('returns empty array for undefined', () => {
    expect(getEcoPlans(undefined)).toEqual([])
  })

  it('returns empty array for null', () => {
    expect(getEcoPlans(null)).toEqual([])
  })

  it('each plan in the array has the correct structure', () => {
    const plans = getEcoPlans('ignis')
    plans.forEach((plan) => {
      expect(plan).toHaveProperty('id')
      expect(plan).toHaveProperty('name')
      expect(plan).toHaveProperty('duration')
      expect(plan).toHaveProperty('price_mzn')
      expect(plan).toHaveProperty('price_usd')
      expect(plan).toHaveProperty('discount')
    })
  })
})

// ===== getEcoTheme() =====

describe('getEcoTheme', () => {
  it('returns correct theme for vitalis', () => {
    const theme = getEcoTheme('vitalis')
    expect(theme.name).toBe('Vitalis')
    expect(theme.color).toBe('#7C8B6F')
    expect(theme.colorDark).toBe('#5A6B4D')
  })

  it('returns correct theme for aurea', () => {
    const theme = getEcoTheme('aurea')
    expect(theme.name).toBe('Aurea')
    expect(theme.color).toBe('#C4A265')
    expect(theme.colorDark).toBe('#2D2A24')
  })

  it('returns correct theme for aurora', () => {
    const theme = getEcoTheme('aurora')
    expect(theme.name).toBe('Aurora')
    expect(theme.color).toBe('#D4A5A5')
    expect(theme.colorDark).toBe('#2e1a1a')
  })

  it('returns fallback theme for invalid eco', () => {
    const theme = getEcoTheme('nonexistent')
    expect(theme.name).toBe('nonexistent')
    expect(theme.color).toBe('#666')
    expect(theme.colorDark).toBe('#1a1a1a')
  })

  it('returns fallback theme for undefined', () => {
    const theme = getEcoTheme(undefined)
    expect(theme.name).toBeUndefined()
    expect(theme.color).toBe('#666')
    expect(theme.colorDark).toBe('#1a1a1a')
  })

  it('returns fallback theme for null', () => {
    const theme = getEcoTheme(null)
    expect(theme.name).toBeNull()
    expect(theme.color).toBe('#666')
    expect(theme.colorDark).toBe('#1a1a1a')
  })

  it('returns theme with name, color, and colorDark for all ecos', () => {
    Object.keys(ECO_PLANS).forEach((eco) => {
      const theme = getEcoTheme(eco)
      expect(theme).toHaveProperty('name')
      expect(theme).toHaveProperty('color')
      expect(theme).toHaveProperty('colorDark')
    })
  })
})

// ===== calculateBundlePrice() =====

describe('calculateBundlePrice', () => {
  it('returns null for null ecoKeys', () => {
    expect(calculateBundlePrice(null)).toBeNull()
  })

  it('returns null for undefined ecoKeys', () => {
    expect(calculateBundlePrice(undefined)).toBeNull()
  })

  it('returns null for empty array', () => {
    expect(calculateBundlePrice([])).toBeNull()
  })

  it('returns null for single eco (less than 2)', () => {
    expect(calculateBundlePrice(['vitalis'])).toBeNull()
  })

  // Duo (2 ecos)
  it('calculates duo bundle for 2 ecos (monthly)', () => {
    const result = calculateBundlePrice(['vitalis', 'aurea'], 'monthly')
    expect(result).not.toBeNull()
    expect(result.bundle.id).toBe('duo')
    expect(result.discount).toBe(15)
    expect(result.period).toBe('monthly')
    expect(result.individualTotal).toBe(2500 + 975) // vitalis + aurea monthly
    expect(result.bundlePrice).toBe(BUNDLE_PLANS.duo.monthly.price_mzn)
    expect(result.savings).toBe(result.individualTotal - result.bundlePrice)
  })

  it('calculates duo bundle for 2 ecos (semestral)', () => {
    const result = calculateBundlePrice(['serena', 'ignis'], 'semestral')
    expect(result).not.toBeNull()
    expect(result.bundle.id).toBe('duo')
    expect(result.individualTotal).toBe(3825 + 3825) // serena + ignis semestral
    expect(result.bundlePrice).toBe(BUNDLE_PLANS.duo.semestral.price_mzn)
  })

  it('calculates duo bundle for 2 ecos (annual)', () => {
    const result = calculateBundlePrice(['vitalis', 'serena'], 'annual')
    expect(result).not.toBeNull()
    expect(result.bundle.id).toBe('duo')
    expect(result.bundlePrice).toBe(BUNDLE_PLANS.duo.annual.price_mzn)
  })

  // Trio (3 ecos)
  it('calculates trio bundle for 3 ecos', () => {
    const result = calculateBundlePrice(['vitalis', 'aurea', 'serena'], 'monthly')
    expect(result).not.toBeNull()
    expect(result.bundle.id).toBe('trio')
    expect(result.discount).toBe(25)
    expect(result.individualTotal).toBe(2500 + 975 + 750)
    expect(result.bundlePrice).toBe(BUNDLE_PLANS.trio.monthly.price_mzn)
  })

  it('calculates trio bundle for 4 ecos', () => {
    const result = calculateBundlePrice(['vitalis', 'aurea', 'serena', 'ignis'], 'monthly')
    expect(result).not.toBeNull()
    expect(result.bundle.id).toBe('trio')
    expect(result.discount).toBe(25)
  })

  // Jornada (5+ ecos)
  it('calculates jornada bundle for 5 ecos', () => {
    const result = calculateBundlePrice(['vitalis', 'aurea', 'serena', 'ignis', 'ventis'], 'monthly')
    expect(result).not.toBeNull()
    expect(result.bundle.id).toBe('jornada')
    expect(result.discount).toBe(35)
    expect(result.individualTotal).toBe(2500 + 975 + 750 + 750 + 750)
    expect(result.bundlePrice).toBe(BUNDLE_PLANS.jornada.monthly.price_mzn)
  })

  it('calculates jornada bundle for 6 ecos', () => {
    const result = calculateBundlePrice(['vitalis', 'aurea', 'serena', 'ignis', 'ventis', 'ecoa'], 'monthly')
    expect(result).not.toBeNull()
    expect(result.bundle.id).toBe('jornada')
    expect(result.discount).toBe(35)
  })

  it('calculates jornada bundle for 7 ecos', () => {
    const result = calculateBundlePrice(
      ['vitalis', 'aurea', 'serena', 'ignis', 'ventis', 'ecoa', 'imago'],
      'monthly'
    )
    expect(result).not.toBeNull()
    expect(result.bundle.id).toBe('jornada')
    expect(result.discount).toBe(35)
  })

  // Tudo (8+ ecos, i.e. all 7 paid + aurora)
  it('calculates tudo bundle for 8 ecos (all including aurora)', () => {
    const result = calculateBundlePrice(
      ['vitalis', 'aurea', 'serena', 'ignis', 'ventis', 'ecoa', 'imago', 'aurora'],
      'monthly'
    )
    expect(result).not.toBeNull()
    expect(result.bundle.id).toBe('tudo')
    expect(result.discount).toBe(40)
    expect(result.bundlePrice).toBe(BUNDLE_PLANS.tudo.monthly.price_mzn)
  })

  // Default period
  it('defaults to monthly period when not specified', () => {
    const result = calculateBundlePrice(['vitalis', 'aurea'])
    expect(result).not.toBeNull()
    expect(result.period).toBe('monthly')
  })

  // Savings are positive
  it('savings are positive (bundle is cheaper than individual)', () => {
    const result = calculateBundlePrice(['vitalis', 'aurea'], 'monthly')
    expect(result.savings).toBeGreaterThan(0)
  })

  // Handles unknown ecos gracefully (they contribute 0 to individual total)
  it('handles unknown eco keys (they add 0 to individual total)', () => {
    const result = calculateBundlePrice(['vitalis', 'nonexistent'], 'monthly')
    expect(result).not.toBeNull()
    expect(result.individualTotal).toBe(2500) // only vitalis counted
  })

  // Return structure
  it('returns object with expected keys', () => {
    const result = calculateBundlePrice(['vitalis', 'aurea'], 'monthly')
    expect(result).toHaveProperty('bundle')
    expect(result).toHaveProperty('individualTotal')
    expect(result).toHaveProperty('bundlePrice')
    expect(result).toHaveProperty('savings')
    expect(result).toHaveProperty('discount')
    expect(result).toHaveProperty('period')
  })
})
