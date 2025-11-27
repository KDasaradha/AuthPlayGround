'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Shield,
  Key,
  Lock,
  UserCheck,
  Mail,
  Smartphone,
  Clock,
  Fingerprint,
  Globe,
  Users,
  KeyRound,
  User,
  Settings,
  FileText,
  GitBranch,
  Network,
  Building,
  Target,
  Search,
  Filter,
  Star,
  BookOpen,
  Code,
  CheckCircle,
  ArrowRight,
  Info,
  Zap,
  ShieldCheck,
  LockKeyhole,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { useState, useEffect } from 'react'

const authMethods = [
  {
    id: 'basic-auth',
    title: 'Basic Auth',
    description: 'Username and password authentication',
    icon: Key,
    color: 'bg-blue-500',
    difficulty: 'Basic',
    popularity: 85,
    useCase: 'Simple internal applications',
    pros: ['Simple to implement', 'Widely supported'],
    cons: ['Less secure', 'Password management required'],
    category: 'password-based'
  },
  {
    id: 'session-auth',
    title: 'Session Auth',
    description: 'Server-side session management',
    icon: Clock,
    color: 'bg-green-500',
    difficulty: 'Basic',
    popularity: 90,
    useCase: 'Traditional web applications',
    pros: ['Secure', 'Server-controlled'],
    cons: ['Stateful', 'Scalability challenges'],
    category: 'token-based'
  },
  {
    id: 'token-auth',
    title: 'Token Auth',
    description: 'Simple token-based authentication',
    icon: KeyRound,
    color: 'bg-purple-500',
    difficulty: 'Intermediate',
    popularity: 80,
    useCase: 'API authentication',
    pros: ['Stateless', 'API friendly'],
    cons: ['Token management required'],
    category: 'token-based'
  },
  {
    id: 'jwt',
    title: 'JWT (Access & Refresh)',
    description: 'JSON Web Tokens with refresh mechanism',
    icon: Shield,
    color: 'bg-orange-500',
    difficulty: 'Intermediate',
    popularity: 95,
    useCase: 'Modern web and mobile apps',
    pros: ['Stateless', 'Self-contained', 'Cross-platform'],
    cons: ['Token revocation complexity', 'Size overhead'],
    category: 'token-based'
  },
  {
    id: 'oauth2',
    title: 'OAuth2',
    description: 'Authorization framework for third-party access',
    icon: Globe,
    color: 'bg-cyan-500',
    difficulty: 'Advanced',
    popularity: 90,
    useCase: 'Third-party integrations',
    pros: ['Industry standard', 'Delegated access'],
    cons: ['Complex implementation', 'Multiple flows'],
    category: 'delegated'
  },
  {
    id: 'social-login',
    title: 'Social Login',
    description: 'Authentication via social providers',
    icon: Users,
    color: 'bg-pink-500',
    difficulty: 'Intermediate',
    popularity: 85,
    useCase: 'Consumer applications',
    pros: ['No password needed', 'Improved UX'],
    cons: ['Privacy concerns', 'Provider dependency'],
    category: 'delegated'
  },
  {
    id: 'passwordless',
    title: 'Passwordless',
    description: 'Authentication without passwords',
    icon: Lock,
    color: 'bg-teal-500',
    difficulty: 'Intermediate',
    popularity: 75,
    useCase: 'Security-focused applications',
    pros: ['Higher security', 'Better UX'],
    cons: ['Implementation complexity'],
    category: 'passwordless'
  },
  {
    id: 'magic-link',
    title: 'Magic Link',
    description: 'Email-based login links',
    icon: Mail,
    color: 'bg-indigo-500',
    difficulty: 'Intermediate',
    popularity: 70,
    useCase: 'Simple passwordless login',
    pros: ['No passwords', 'Email verification'],
    cons: ['Email dependency', 'Slower login'],
    category: 'passwordless'
  },
  {
    id: 'email-otp',
    title: 'Email OTP',
    description: 'One-time passwords via email',
    icon: Mail,
    color: 'bg-blue-600',
    difficulty: 'Intermediate',
    popularity: 75,
    useCase: 'Second factor verification',
    pros: ['No passwords', 'Additional security'],
    cons: ['Email dependency', 'Delivery delays'],
    category: 'multi-factor'
  },
  {
    id: 'sms-otp',
    title: 'SMS OTP',
    description: 'One-time passwords via SMS',
    icon: Smartphone,
    color: 'bg-green-600',
    difficulty: 'Intermediate',
    popularity: 80,
    useCase: 'Mobile-first applications',
    pros: ['No passwords', 'Widely accessible'],
    cons: ['SMS costs', 'Security concerns'],
    category: 'multi-factor'
  },
  {
    id: 'totp',
    title: 'TOTP (Google Authenticator)',
    description: 'Time-based one-time passwords',
    icon: Clock,
    color: 'bg-red-500',
    difficulty: 'Advanced',
    popularity: 85,
    useCase: 'Two-factor authentication',
    pros: ['Strong security', 'Offline capable'],
    cons: ['Device dependency', 'Setup complexity'],
    category: 'multi-factor'
  },
  {
    id: '2fa',
    title: '2FA',
    description: 'Two-factor authentication',
    icon: UserCheck,
    color: 'bg-yellow-500',
    difficulty: 'Advanced',
    popularity: 90,
    useCase: 'Security-sensitive applications',
    pros: ['Enhanced security', 'Multiple options'],
    cons: ['User friction', 'Backup needed'],
    category: 'multi-factor'
  },
  {
    id: 'api-keys',
    title: 'API Keys',
    description: 'Key-based API authentication',
    icon: Key,
    color: 'bg-gray-600',
    difficulty: 'Intermediate',
    popularity: 85,
    useCase: 'Service-to-service communication',
    pros: ['Simple', 'Fine-grained control'],
    cons: ['Key management', 'Revocation challenges'],
    category: 'token-based'
  },
  {
    id: 'webauthn',
    title: 'WebAuthn / Passkeys',
    description: 'Biometric and hardware-based auth',
    icon: Fingerprint,
    color: 'bg-purple-600',
    difficulty: 'Advanced',
    popularity: 70,
    useCase: 'Modern passwordless authentication',
    pros: ['Phishing resistant', 'User-friendly'],
    cons: ['New technology', 'Limited support'],
    category: 'passwordless'
  },
  {
    id: 'saml',
    title: 'SAML',
    description: 'Enterprise single sign-on',
    icon: Building,
    color: 'bg-blue-700',
    difficulty: 'Advanced',
    popularity: 75,
    useCase: 'Enterprise applications',
    pros: ['SSO', 'Enterprise integration'],
    cons: ['Complex', 'XML-based'],
    category: 'enterprise'
  }
]

const authzModels = [
  {
    id: 'rbac',
    title: 'RBAC',
    description: 'Role-Based Access Control',
    icon: User,
    color: 'bg-emerald-500',
    difficulty: 'Intermediate',
    popularity: 95,
    useCase: 'Most applications with user roles',
    pros: ['Simple to understand', 'Easy to manage'],
    cons: ['Role explosion', 'Limited flexibility'],
    category: 'role-based'
  },
  {
    id: 'hierarchical-rbac',
    title: 'Hierarchical RBAC',
    description: 'Multi-level role hierarchy',
    icon: GitBranch,
    color: 'bg-green-700',
    difficulty: 'Advanced',
    popularity: 70,
    useCase: 'Complex organizations',
    pros: ['Inheritance', 'Reduced duplication'],
    cons: ['Complexity', 'Circular dependencies'],
    category: 'role-based'
  },
  {
    id: 'permission-based',
    title: 'Permission-based',
    description: 'Direct permission assignments',
    icon: FileText,
    color: 'bg-blue-500',
    difficulty: 'Intermediate',
    popularity: 80,
    useCase: 'Fine-grained access control',
    pros: ['Granular control', 'Flexible'],
    cons: ['Management overhead', 'Complexity'],
    category: 'attribute-based'
  },
  {
    id: 'abac',
    title: 'ABAC',
    description: 'Attribute-Based Access Control',
    icon: Settings,
    color: 'bg-purple-500',
    difficulty: 'Advanced',
    popularity: 75,
    useCase: 'Dynamic access decisions',
    pros: ['Context-aware', 'Fine-grained'],
    cons: ['Complex rules', 'Performance impact'],
    category: 'attribute-based'
  },
  {
    id: 'pbac',
    title: 'PBAC',
    description: 'Policy-Based Access Control',
    icon: FileText,
    color: 'bg-orange-500',
    difficulty: 'Advanced',
    popularity: 70,
    useCase: 'Compliance-driven applications',
    pros: ['Expressive policies', 'Auditable'],
    cons: ['Complex implementation', 'Rule management'],
    category: 'policy-based'
  },
  {
    id: 'acl',
    title: 'ACL',
    description: 'Access Control Lists',
    icon: Network,
    color: 'bg-cyan-500',
    difficulty: 'Intermediate',
    popularity: 75,
    useCase: 'File systems and network resources',
    pros: ['Simple concept', 'Fine-grained'],
    cons: ['Scalability issues', 'Management overhead'],
    category: 'rule-based'
  },
  {
    id: 'multi-tenant',
    title: 'Multi-tenant / Organization-based',
    description: 'Tenant-scoped authorization',
    icon: Building,
    color: 'bg-indigo-500',
    difficulty: 'Advanced',
    popularity: 80,
    useCase: 'SaaS applications',
    pros: ['Data isolation', 'Tenant autonomy'],
    cons: ['Complex implementation', 'Cross-tenant access'],
    category: 'tenant-based'
  },
  {
    id: 'scope-based',
    title: 'Scope-based',
    description: 'OAuth-style scope authorization',
    icon: Target,
    color: 'bg-pink-500',
    difficulty: 'Intermediate',
    popularity: 85,
    useCase: 'API access control',
    pros: ['Delegated access', 'Granular permissions'],
    cons: ['Scope management', 'User understanding'],
    category: 'policy-based'
  }
]

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Basic': return 'bg-green-100 text-green-800 border-green-200'
    case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'Advanced': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getPopularityColor(popularity: number) {
  if (popularity >= 90) return 'bg-blue-100 text-blue-800 border-blue-200'
  if (popularity >= 80) return 'bg-green-100 text-green-800 border-green-200'
  if (popularity >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-gray-100 text-gray-800 border-gray-200'
}

function getCategoryColor(category: string) {
  const categoryColors: Record<string, string> = {
    'password-based': 'bg-blue-50 text-blue-700 border-blue-200',
    'token-based': 'bg-purple-50 text-purple-700 border-purple-200',
    'delegated': 'bg-pink-50 text-pink-700 border-pink-200',
    'passwordless': 'bg-teal-50 text-teal-700 border-teal-200',
    'multi-factor': 'bg-orange-50 text-orange-700 border-orange-200',
    'enterprise': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'role-based': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'attribute-based': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'policy-based': 'bg-amber-50 text-amber-700 border-amber-200',
    'rule-based': 'bg-slate-50 text-slate-700 border-slate-200',
    'tenant-based': 'bg-violet-50 text-violet-700 border-violet-200'
  }
  return categoryColors[category] || 'bg-gray-50 text-gray-700 border-gray-200'
}

// Component for expandable card details
function ExpandableCard({ item, type, onItemClick }: { item: any, type: string, onItemClick: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const IconComponent = item.icon

  // Modified to use onClick handler instead of direct navigation
  const handleCardClick = () => {
    onItemClick(item.id)
  }

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 hover:border-primary/30 overflow-hidden h-full flex flex-col">
      <div onClick={handleCardClick} className="flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-3 rounded-xl ${item.color} text-white group-hover:scale-110 transition-transform shadow-lg`}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Badge className={`${getDifficultyColor(item.difficulty)} text-xs font-medium`}>
                {item.difficulty}
              </Badge>
              <Badge className={`${getPopularityColor(item.popularity)} text-xs font-medium`}>
                {item.popularity}% popular
              </Badge>
            </div>
          </div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {item.title}
          </CardTitle>
          <Badge className={`${getCategoryColor(item.category)} text-xs w-fit mt-2`}>
            {item.category.replace('-', ' ')}
          </Badge>
        </CardHeader>
        <CardContent className="grow flex flex-col">
          <CardDescription className="text-sm mb-3">
            {item.description}
          </CardDescription>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            <span className="font-medium">Use case:</span> {item.useCase}
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="p-0 h-auto text-primary hover:bg-transparent">
                Learn more <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-slate-500 hover:bg-transparent"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setExpanded(!expanded)
                }}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </div>

      {expanded && (
        <div className="px-6 pb-4 border-t bg-slate-50 dark:bg-slate-800/50">
          <div className="pt-4">
            <div className="mb-3">
              <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Pros
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                {item.pros.map((pro: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-3 w-3 mr-1.5 mt-0.5 text-green-500 shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Cons
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                {item.cons.map((con: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <AlertCircle className="h-3 w-3 mr-1.5 mt-0.5 text-red-500 shrink-0" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

// Filter component
function FilterControls({
  searchTerm,
  setSearchTerm,
  difficultyFilter,
  setDifficultyFilter,
  categoryFilter,
  setCategoryFilter,
  type,
  categories
}: {
  searchTerm: string
  setSearchTerm: (term: string) => void
  difficultyFilter: string
  setDifficultyFilter: (filter: string) => void
  categoryFilter: string
  setCategoryFilter: (filter: string) => void
  type: string
  categories: string[]
}) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder={`Search ${type === 'auth' ? 'authentication methods' : 'authorization models'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Button
          variant="outline"
          className="h-12"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {(difficultyFilter !== 'all' || categoryFilter !== 'all') && (
            <Badge className="ml-2 h-5 px-1.5 text-xs">Active</Badge>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Filter Options</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowFilters(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Difficulty</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={difficultyFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficultyFilter('all')}
                  className="h-8 text-xs"
                >
                  All
                </Button>
                <Button
                  variant={difficultyFilter === 'basic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficultyFilter('basic')}
                  className="h-8 text-xs"
                >
                  Basic
                </Button>
                <Button
                  variant={difficultyFilter === 'intermediate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficultyFilter('intermediate')}
                  className="h-8 text-xs"
                >
                  Intermediate
                </Button>
                <Button
                  variant={difficultyFilter === 'advanced' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficultyFilter('advanced')}
                  className="h-8 text-xs"
                >
                  Advanced
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Category</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={categoryFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('all')}
                  className="h-8 text-xs"
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter(category)}
                    className="h-8 text-xs"
                  >
                    {category.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Comparison modal component
function ComparisonModal({ isOpen, onClose, items }: { isOpen: boolean, onClose: () => void, items: any[] }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold">Compare Methods</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Select methods to compare their features, pros, and cons.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${item.color} text-white`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <Badge className={getDifficultyColor(item.difficulty)}>
                      {item.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'auth')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const [authSearchTerm, setAuthSearchTerm] = useState('')
  const [authzSearchTerm, setAuthzSearchTerm] = useState('')
  const [authDifficultyFilter, setAuthDifficultyFilter] = useState('all')
  const [authzDifficultyFilter, setAuthzDifficultyFilter] = useState('all')
  const [authCategoryFilter, setAuthCategoryFilter] = useState('all')
  const [authzCategoryFilter, setAuthzCategoryFilter] = useState('all')
  const [showComparisonModal, setShowComparisonModal] = useState(false)
  const [comparisonType, setComparisonType] = useState<'auth' | 'authz'>('auth')

  // Extract unique categories
  const authCategories = Array.from(new Set(authMethods.map(method => method.category)))
  const authzCategories = Array.from(new Set(authzModels.map(model => model.category)))

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams)
    params.set('tab', value)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Handle item click
  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId)
    // Navigate to the appropriate page with the item ID as a parameter
    if (activeTab === 'auth') {
      router.push(`/auth/${itemId}`, { scroll: false })
    } else {
      router.push(`/authz/${itemId}`, { scroll: false })
    }
  }

  const filteredAuthMethods = authMethods.filter(method => {
    const matchesSearch = method.title.toLowerCase().includes(authSearchTerm.toLowerCase()) ||
      method.description.toLowerCase().includes(authSearchTerm.toLowerCase())
    const matchesDifficulty = authDifficultyFilter === 'all' ||
      method.difficulty.toLowerCase() === authDifficultyFilter.toLowerCase()
    const matchesCategory = authCategoryFilter === 'all' ||
      method.category === authCategoryFilter
    return matchesSearch && matchesDifficulty && matchesCategory
  })

  const filteredAuthzModels = authzModels.filter(model => {
    const matchesSearch = model.title.toLowerCase().includes(authzSearchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(authzSearchTerm.toLowerCase())
    const matchesDifficulty = authzDifficultyFilter === 'all' ||
      model.difficulty.toLowerCase() === authzDifficultyFilter.toLowerCase()
    const matchesCategory = authzCategoryFilter === 'all' ||
      model.category === authzCategoryFilter
    return matchesSearch && matchesDifficulty && matchesCategory
  })

  // Sort methods by popularity by default
  useEffect(() => {
    if (authSearchTerm === '' && authDifficultyFilter === 'all' && authCategoryFilter === 'all') {
      // Default sorting is already by popularity in the original array
    }
  }, [authSearchTerm, authDifficultyFilter, authCategoryFilter])

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Authentication & Authorization
              <span className="text-primary"> Playground</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-6">
              Master every authentication method and authorization model through interactive simulations and detailed explanations
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Interactive Demos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Code className="h-4 w-4 text-blue-500" />
                <span>Code Examples</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>Best Practices</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <BookOpen className="h-4 w-4 text-purple-500" />
                <span>Comprehensive Guides</span>
              </div>
            </div>
          </div>

          {/* Getting Started Section */}
          <section className="mb-12">
            <Card className="bg-linear-to-r from-primary/10 to-primary/5 border-primary/20 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      New to Authentication & Authorization?
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      Start with our learning path to understand the fundamentals and build your knowledge step by step.
                    </p>
                  </div>
                  <Button size="lg" className="shrink-0">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Main Content with Tabs */}
          <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="mb-16">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
              <TabsTrigger value="auth" className="text-base">
                <LockKeyhole className="mr-2 h-4 w-4" />
                Authentication Methods
              </TabsTrigger>
              <TabsTrigger value="authz" className="text-base">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Authorization Models
              </TabsTrigger>
            </TabsList>

            <TabsContent value="auth" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Authentication Methods
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Explore different ways to verify user identity
                </p>
              </div>

              <FilterControls
                searchTerm={authSearchTerm}
                setSearchTerm={setAuthSearchTerm}
                difficultyFilter={authDifficultyFilter}
                setDifficultyFilter={setAuthDifficultyFilter}
                categoryFilter={authCategoryFilter}
                setCategoryFilter={setAuthCategoryFilter}
                type="auth"
                categories={authCategories}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAuthMethods.map((method) => (
                  <ExpandableCard key={method.id} item={method} type="auth" onItemClick={handleItemClick} />
                ))}
              </div>

              {filteredAuthMethods.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400">
                    No authentication methods found matching your criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setAuthSearchTerm('')
                      setAuthDifficultyFilter('all')
                      setAuthCategoryFilter('all')
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="authz" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Authorization Models
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Learn different approaches to control access to resources
                </p>
              </div>

              <FilterControls
                searchTerm={authzSearchTerm}
                setSearchTerm={setAuthzSearchTerm}
                difficultyFilter={authzDifficultyFilter}
                setDifficultyFilter={setAuthzDifficultyFilter}
                categoryFilter={authzCategoryFilter}
                setCategoryFilter={setAuthzCategoryFilter}
                type="authz"
                categories={authzCategories}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAuthzModels.map((model) => (
                  <ExpandableCard key={model.id} item={model} type="authz" onItemClick={handleItemClick} />
                ))}
              </div>

              {filteredAuthzModels.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400">
                    No authorization models found matching your criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setAuthzSearchTerm('')
                      setAuthzDifficultyFilter('all')
                      setAuthzCategoryFilter('all')
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Comparison Section */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Compare Methods
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Not sure which method to use? Compare different options side by side.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setComparisonType('auth')
                  setShowComparisonModal(true)
                }}
              >
                <Filter className="mr-2 h-5 w-5" />
                Compare Authentication Methods
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setComparisonType('authz')
                  setShowComparisonModal(true)
                }}
              >
                <Filter className="mr-2 h-5 w-5" />
                Compare Authorization Models
              </Button>
            </div>
          </section>

          {/* Resources Section */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Learning Resources
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Deepen your understanding with our comprehensive guides and tutorials
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-primary" />
                    Fundamentals Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Learn the core concepts of authentication and authorization systems
                  </CardDescription>
                  <Button variant="ghost" className="mt-4 p-0">
                    Read Guide <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="mr-2 h-5 w-5 text-primary" />
                    Implementation Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Discover best practices for implementing auth systems in different frameworks
                  </CardDescription>
                  <Button variant="ghost" className="mt-4 p-0">
                    View Patterns <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
                    Security Considerations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Understand security implications and how to protect against common threats
                  </CardDescription>
                  <Button variant="ghost" className="mt-4 p-0">
                    Learn Security <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Popular Methods Section */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center justify-center">
                <TrendingUp className="mr-2 h-6 w-6 text-primary" />
                Popular Methods
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Discover the most widely used authentication and authorization methods
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-blue-600" />
                    JWT (Access & Refresh)
                  </CardTitle>
                  <Badge className="w-fit bg-blue-100 text-blue-800 border-blue-200">
                    95% Popular
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    JSON Web Tokens with refresh mechanism for modern web and mobile apps
                  </CardDescription>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    Learn More <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-linear-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <User className="mr-2 h-5 w-5 text-emerald-600" />
                    RBAC
                  </CardTitle>
                  <Badge className="w-fit bg-emerald-100 text-emerald-800 border-emerald-200">
                    95% Popular
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Role-Based Access Control for applications with user roles
                  </CardDescription>
                  <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                    Learn More <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-16 text-center text-slate-500 dark:text-slate-400">
            <p className="mb-4">
              Interactive learning environment for modern authentication and authorization patterns
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="ghost" size="sm">
                <Star className="mr-1 h-4 w-4" />
                Rate Us
              </Button>
              <Button variant="ghost" size="sm">
                <Info className="mr-1 h-4 w-4" />
                About
              </Button>
              <Button variant="ghost" size="sm">
                <Code className="mr-1 h-4 w-4" />
                GitHub
              </Button>
            </div>
            <div className="mt-6 text-xs text-slate-400">
              © 2023 Auth Playground. All rights reserved.
            </div>
          </footer>
        </div>
      </div>

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        items={comparisonType === 'auth' ? authMethods : authzModels}
      />
    </TooltipProvider>
  )
}