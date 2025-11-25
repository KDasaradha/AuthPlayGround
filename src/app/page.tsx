'use client'

import Link from 'next/link'
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
  ChevronUp
} from 'lucide-react'
import { useState } from 'react'

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
    cons: ['Less secure', 'Password management required']
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
    cons: ['Stateful', 'Scalability challenges']
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
    cons: ['Token management required']
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
    cons: ['Token revocation complexity', 'Size overhead']
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
    cons: ['Complex implementation', 'Multiple flows']
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
    cons: ['Privacy concerns', 'Provider dependency']
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
    cons: ['Implementation complexity']
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
    cons: ['Email dependency', 'Slower login']
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
    cons: ['Email dependency', 'Delivery delays']
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
    cons: ['SMS costs', 'Security concerns']
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
    cons: ['Device dependency', 'Setup complexity']
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
    cons: ['User friction', 'Backup needed']
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
    cons: ['Key management', 'Revocation challenges']
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
    cons: ['New technology', 'Limited support']
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
    cons: ['Complex', 'XML-based']
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
    cons: ['Role explosion', 'Limited flexibility']
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
    cons: ['Complexity', 'Circular dependencies']
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
    cons: ['Management overhead', 'Complexity']
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
    cons: ['Complex rules', 'Performance impact']
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
    cons: ['Complex implementation', 'Rule management']
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
    cons: ['Scalability issues', 'Management overhead']
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
    cons: ['Complex implementation', 'Cross-tenant access']
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
    cons: ['Scope management', 'User understanding']
  }
]

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Basic': return 'bg-green-100 text-green-800'
    case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
    case 'Advanced': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getPopularityColor(popularity: number) {
  if (popularity >= 90) return 'bg-blue-100 text-blue-800'
  if (popularity >= 80) return 'bg-green-100 text-green-800'
  if (popularity >= 70) return 'bg-yellow-100 text-yellow-800'
  return 'bg-gray-100 text-gray-800'
}

// Component for expandable card details
function ExpandableCard({ item, type }: { item: any, type: string }) {
  const [expanded, setExpanded] = useState(false)
  const IconComponent = item.icon
  const href = type === 'auth' ? `/auth/${item.id}` : `/authz/${item.id}`
  
  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg border-2 hover:border-primary/50 overflow-hidden">
      <Link href={href}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-3 rounded-lg ${item.color} text-white group-hover:scale-110 transition-transform`}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={getDifficultyColor(item.difficulty)}>
                {item.difficulty}
              </Badge>
              <Badge className={getPopularityColor(item.popularity)}>
                {item.popularity}% popular
              </Badge>
            </div>
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm mb-2">
            {item.description}
          </CardDescription>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span className="font-medium">Use case:</span> {item.useCase}
          </div>
          
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="p-0 h-auto text-primary">
              Learn more <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-auto text-slate-500"
              onClick={(e) => {
                e.preventDefault()
                setExpanded(!expanded)
              }}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Link>
      
      {expanded && (
        <div className="px-6 pb-4 border-t">
          <div className="pt-4">
            <div className="mb-3">
              <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Pros:</h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                {item.pros.map((pro: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-3 w-3 mr-1 mt-0.5 text-green-500 flex-shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Cons:</h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                {item.cons.map((con: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="h-3 w-3 mr-1 mt-0.5 text-red-500 flex-shrink-0 rounded-full border border-red-500"></div>
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
  type 
}: {
  searchTerm: string
  setSearchTerm: (term: string) => void
  difficultyFilter: string
  setDifficultyFilter: (filter: string) => void
  type: string
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder={`Search ${type === 'auth' ? 'authentication methods' : 'authorization models'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant={difficultyFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDifficultyFilter('all')}
        >
          All
        </Button>
        <Button
          variant={difficultyFilter === 'basic' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDifficultyFilter('basic')}
        >
          Basic
        </Button>
        <Button
          variant={difficultyFilter === 'intermediate' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDifficultyFilter('intermediate')}
        >
          Intermediate
        </Button>
        <Button
          variant={difficultyFilter === 'advanced' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDifficultyFilter('advanced')}
        >
          Advanced
        </Button>
      </div>
    </div>
  )
}

export default function Home() {
  const [authSearchTerm, setAuthSearchTerm] = useState('')
  const [authzSearchTerm, setAuthzSearchTerm] = useState('')
  const [authDifficultyFilter, setAuthDifficultyFilter] = useState('all')
  const [authzDifficultyFilter, setAuthzDifficultyFilter] = useState('all')
  
  const filteredAuthMethods = authMethods.filter(method => {
    const matchesSearch = method.title.toLowerCase().includes(authSearchTerm.toLowerCase()) ||
                         method.description.toLowerCase().includes(authSearchTerm.toLowerCase())
    const matchesDifficulty = authDifficultyFilter === 'all' || 
                              method.difficulty.toLowerCase() === authDifficultyFilter.toLowerCase()
    return matchesSearch && matchesDifficulty
  })
  
  const filteredAuthzModels = authzModels.filter(model => {
    const matchesSearch = model.title.toLowerCase().includes(authzSearchTerm.toLowerCase()) ||
                         model.description.toLowerCase().includes(authzSearchTerm.toLowerCase())
    const matchesDifficulty = authzDifficultyFilter === 'all' || 
                              model.difficulty.toLowerCase() === authzDifficultyFilter.toLowerCase()
    return matchesSearch && matchesDifficulty
  })

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
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
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
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
          <Tabs defaultValue="auth" className="mb-16">
            <TabsList className="grid w-full grid-cols-2 mb-8">
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
                type="auth"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAuthMethods.map((method) => (
                  <ExpandableCard key={method.id} item={method} type="auth" />
                ))}
              </div>
              
              {filteredAuthMethods.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400">
                    No authentication methods found matching your criteria.
                  </p>
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
                type="authz"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAuthzModels.map((model) => (
                  <ExpandableCard key={model.id} item={model} type="authz" />
                ))}
              </div>
              
              {filteredAuthzModels.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400">
                    No authorization models found matching your criteria.
                  </p>
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
            <div className="flex justify-center">
              <Button size="lg" variant="outline">
                <Filter className="mr-2 h-5 w-5" />
                Open Comparison Tool
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
              <Card className="hover:shadow-lg transition-shadow">
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
              <Card className="hover:shadow-lg transition-shadow">
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
              <Card className="hover:shadow-lg transition-shadow">
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

          {/* Footer */}
          <footer className="mt-16 text-center text-slate-500 dark:text-slate-400">
            <p>
              Interactive learning environment for modern authentication and authorization patterns
            </p>
            <div className="flex justify-center gap-4 mt-4">
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
          </footer>
        </div>
      </div>
    </TooltipProvider>
  )
}