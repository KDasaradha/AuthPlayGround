"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Check, 
  X, 
  Users, 
  User, 
  Shield, 
  Code,
  UserCheck,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Plus,
  Play,
  Pause,
  Zap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Policy {
  id: string
  name: string
  description: string
  rules: PolicyRule[]
  enabled: boolean
  priority: number
  createdAt: string
}

interface PolicyRule {
  id: string
  name: string
  condition: string
  action: string
  effect: string
}

interface PolicySet {
  id: string
  name: string
  description: string
  policies: string[]
  enabled: boolean
}

export default function PBACPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [policySets, setPolicySets] = useState<PolicySet[]>([])
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [newPolicyName, setNewPolicyName] = useState("")
  const [newPolicyDescription, setNewPolicyDescription] = useState("")
  const [policyRules, setPolicyRules] = useState<PolicyRule[]>([])
  const [newPolicySetName, setNewPolicySetName] = useState("")
  const [newPolicySetDescription, setNewPolicySetDescription] = useState("")
  const [selectedPoliciesForSet, setSelectedPoliciesForSet] = useState<string[]>([])
  const [evaluationRequest, setEvaluationRequest] = useState({
    policySetId: "",
    context: {}
  })
  const [evaluationResult, setEvaluationResult] = useState<any>(null)
  const { toast } = useToast()

  // Initialize with default data
  useEffect(() => {
    const defaultPolicies: Policy[] = [
      {
        id: "policy_1",
        name: "Admin Access Policy",
        description: "Grants full administrative access",
        rules: [
          { id: "rule_1", name: "Admin Check", condition: "user.role == 'admin'", action: "allow", effect: "permit" },
          { id: "rule_2", name: "Business Hours", condition: "time.hour >= 9 && time.hour <= 17", action: "allow", effect: "permit" }
        ],
        enabled: true,
        priority: 1,
        createdAt: "2024-01-15T10:00:00Z"
      },
      {
        id: "policy_2",
        name: "Developer Access Policy",
        description: "Grants developer-level access",
        rules: [
          { id: "rule_3", name: "Developer Role", condition: "user.role == 'developer'", action: "allow", effect: "permit" },
          { id: "rule_4", name: "Project Access", condition: "user.project == 'assigned'", action: "allow", effect: "permit" },
          { id: "rule_5", name: "Deny Production", condition: "environment == 'production'", action: "allow", effect: "deny" }
        ],
        enabled: true,
        priority: 2,
        createdAt: "2024-01-16T10:00:00Z"
      },
      {
        id: "policy_3",
        name: "Guest Access Policy",
        description: "Limited guest access policy",
        rules: [
          { id: "rule_6", name: "Read Only", condition: "action.type == 'read'", action: "allow", effect: "permit" },
          { id: "rule_7", name: "No Write", condition: "action.type == 'write'", action: "allow", effect: "deny" },
          { id: "rule_8", name: "Time Limit", condition: "time.hour < 6 || time.hour > 22", action: "allow", effect: "deny" }
        ],
        enabled: true,
        priority: 3,
        createdAt: "2024-01-17T10:00:00Z"
      }
    ]

    const defaultPolicySets: PolicySet[] = [
      {
        id: "set_1",
        name: "Corporate Policies",
        description: "Standard corporate access policies",
        policies: ["policy_1", "policy_2"],
        enabled: true
      },
      {
        id: "set_2",
        name: "Development Policies",
        description: "Development environment policies",
        policies: ["policy_2", "policy_3"],
        enabled: true
      },
      {
        id: "set_3",
        name: "Guest Policies",
        description: "Guest access policies",
        policies: ["policy_3"],
        enabled: true
      }
    ]

    setPolicies(defaultPolicies)
    setPolicySets(defaultPolicySets)
  }, [])

  const handleCreatePolicy = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/authz/pbac/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPolicyName,
          description: newPolicyDescription,
          rules: policyRules
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const newPolicy: Policy = {
          id: data.policy.id,
          name: newPolicyName,
          description: newPolicyDescription,
          rules: policyRules,
          enabled: true,
          priority: policies.length + 1,
          createdAt: new Date().toISOString()
        }
        setPolicies([...policies, newPolicy])
        setNewPolicyName("")
        setNewPolicyDescription("")
        setPolicyRules([])
        toast({
          title: "Policy Created",
          description: "New policy has been created successfully"
        })
      } else {
        toast({
          title: "Creation Failed",
          description: data.error || "Failed to create policy",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create policy",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreatePolicySet = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/authz/pbac/policy-set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPolicySetName,
          description: newPolicySetDescription,
          policies: selectedPoliciesForSet
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const newPolicySet: PolicySet = {
          id: data.policySet.id,
          name: newPolicySetName,
          description: newPolicySetDescription,
          policies: selectedPoliciesForSet,
          enabled: true
        }
        setPolicySets([...policySets, newPolicySet])
        setNewPolicySetName("")
        setNewPolicySetDescription("")
        setSelectedPoliciesForSet([])
        toast({
          title: "Policy Set Created",
          description: "New policy set has been created successfully"
        })
      } else {
        toast({
          title: "Creation Failed",
          description: data.error || "Failed to create policy set",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create policy set",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEvaluatePolicySet = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/authz/pbac/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evaluationRequest)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setEvaluationResult(data.result)
        toast({
          title: "Evaluation Complete",
          description: data.result.decision === "permit" ? "Access granted" : "Access denied",
          variant: data.result.decision === "permit" ? "default" : "destructive"
        })
      } else {
        toast({
          title: "Evaluation Failed",
          description: data.error || "Failed to evaluate policy set",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate policy set",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const addPolicyRule = () => {
    const newRule: PolicyRule = {
      id: `rule_${Math.random().toString(36).substring(2, 15)}`,
      name: "",
      condition: "",
      action: "allow",
      effect: "permit"
    }
    setPolicyRules([...policyRules, newRule])
  }

  const updatePolicyRule = (index: number, field: keyof PolicyRule, value: string) => {
    const updatedRules = [...policyRules]
    updatedRules[index] = { ...updatedRules[index], [field]: value }
    setPolicyRules(updatedRules)
  }

  const removePolicyRule = (index: number) => {
    setPolicyRules(policyRules.filter((_, i) => i !== index))
  }

  const togglePolicyInSet = (policyId: string) => {
    setSelectedPoliciesForSet(prev => 
      prev.includes(policyId) 
        ? prev.filter(p => p !== policyId)
        : [...prev, policyId]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <FileText className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">PBAC</h1>
          </div>
          <p className="text-xl text-gray-600">Policy-Based Access Control</p>
          <p className="text-lg text-gray-500 mt-2">Advanced policy engine with rule evaluation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main PBAC Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Policy Management
                </CardTitle>
                <CardDescription>
                  Create policies, organize them into sets, and evaluate access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="policies" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                    <TabsTrigger value="policy-sets">Policy Sets</TabsTrigger>
                    <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="policies" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Policy Definition</h3>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Policy
                        </Button>
                      </div>
                      
                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium mb-3">New Policy</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>Policy Name</Label>
                            <Input
                              value={newPolicyName}
                              onChange={(e) => setNewPolicyName(e.target.value)}
                              placeholder="Enter policy name"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={newPolicyDescription}
                              onChange={(e) => setNewPolicyDescription(e.target.value)}
                              placeholder="Enter policy description"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Policy Rules</Label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={addPolicyRule}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {policyRules.map((rule, index) => (
                            <div key={rule.id} className="flex gap-2 p-3 bg-white rounded border">
                              <Input
                                placeholder="Rule name"
                                value={rule.name}
                                onChange={(e) => updatePolicyRule(index, 'name', e.target.value)}
                                className="flex-1"
                              />
                              <Input
                                placeholder="Condition (e.g., user.role == 'admin')"
                                value={rule.condition}
                                onChange={(e) => updatePolicyRule(index, 'condition', e.target.value)}
                                className="flex-1"
                              />
                              <select
                                value={rule.action}
                                onChange={(e) => updatePolicyRule(index, 'action', e.target.value)}
                                className="p-2 border rounded-md"
                              >
                                <option value="allow">Allow</option>
                                <option value="deny">Deny</option>
                              </select>
                              <select
                                value={rule.effect}
                                onChange={(e) => updatePolicyRule(index, 'effect', e.target.value)}
                                className="p-2 border rounded-md"
                              >
                                <option value="permit">Permit</option>
                                <option value="deny">Deny</option>
                              </select>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removePolicyRule(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleCreatePolicy}
                        disabled={isProcessing || !newPolicyName || policyRules.length === 0}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Policy
                          </>
                        )}
                      </Button>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Existing Policies</h4>
                        <div className="space-y-2">
                          {policies.map((policy) => (
                            <Card key={policy.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-semibold">{policy.name}</h5>
                                  <div className="flex gap-2">
                                    <Badge variant={policy.enabled ? "default" : "secondary"}>
                                      {policy.enabled ? "Enabled" : "Disabled"}
                                    </Badge>
                                    <Badge variant="outline">Priority: {policy.priority}</Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
                                <div className="space-y-1">
                                  {policy.rules.map((rule, index) => (
                                    <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                                      {rule.action}: {rule.condition} → {rule.effect}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="policy-sets" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Policy Set Management</h3>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Policy Set
                        </Button>
                      </div>
                      
                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium mb-3">New Policy Set</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>Policy Set Name</Label>
                            <Input
                              value={newPolicySetName}
                              onChange={(e) => setNewPolicySetName(e.target.value)}
                              placeholder="Enter policy set name"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={newPolicySetDescription}
                              onChange={(e) => setNewPolicySetDescription(e.target.value)}
                              placeholder="Enter policy set description"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Select Policies</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {policies.map((policy) => (
                              <Button
                                key={policy.id}
                                variant={selectedPoliciesForSet.includes(policy.id) ? "default" : "outline"}
                                size="sm"
                                onClick={() => togglePolicyInSet(policy.id)}
                                className="justify-start"
                              >
                                <Check className={`h-4 w-4 mr-2 ${selectedPoliciesForSet.includes(policy.id) ? '' : 'opacity-50'}`} />
                                {policy.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleCreatePolicySet}
                        disabled={isProcessing || !newPolicySetName || selectedPoliciesForSet.length === 0}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Policy Set
                          </>
                        )}
                      </Button>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Existing Policy Sets</h4>
                        <div className="space-y-2">
                          {policySets.map((set) => (
                            <Card key={set.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-semibold">{set.name}</h5>
                                  <Badge variant={set.enabled ? "default" : "secondary"}>
                                    {set.enabled ? "Enabled" : "Disabled"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{set.description}</p>
                                <div className="space-y-1">
                                  {set.policies.map((policyId) => {
                                    const policy = policies.find(p => p.id === policyId)
                                    return policy ? (
                                      <div key={policyId} className="text-sm bg-gray-50 p-2 rounded">
                                        📄 {policy.name}
                                      </div>
                                    ) : null
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="evaluate" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Policy Set Evaluation</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Policy Set</Label>
                          <select
                            value={evaluationRequest.policySetId}
                            onChange={(e) => setEvaluationRequest({...evaluationRequest, policySetId: e.target.value})}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Select a policy set</option>
                            {policySets.map((set) => (
                              <option key={set.id} value={set.id}>
                                {set.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Context (JSON)</Label>
                          <textarea
                            value={JSON.stringify(evaluationRequest.context, null, 2)}
                            onChange={(e) => setEvaluationRequest({...evaluationRequest, context: JSON.parse(e.target.value)})}
                            placeholder='{"user": {"role": "admin"}, "resource": {"type": "sensitive"}}'
                            className="w-full h-20 p-3 border rounded-md font-mono text-sm"
                          />
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleEvaluatePolicySet}
                        disabled={isProcessing || !evaluationRequest.policySetId}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Evaluating...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Evaluate Policy Set
                          </>
                        )}
                      </Button>
                      
                      {evaluationResult && (
                        <div className="space-y-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold">Evaluation Result</h4>
                                <Badge variant={evaluationResult.decision === "permit" ? "default" : "destructive"} className="text-lg px-3 py-1">
                                  {evaluationResult.decision.toUpperCase()}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Applied Policies</Label>
                                  <div className="space-y-1 mt-2">
                                    {evaluationResult.appliedPolicies?.map((policy: any, index: number) => (
                                      <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                                        📄 {policy.name}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <Label>Triggered Rules</Label>
                                  <div className="space-y-1 mt-2">
                                    {evaluationResult.triggeredRules?.map((rule: any, index: number) => (
                                      <div key={index} className="text-sm bg-green-50 p-2 rounded">
                                        ✓ {rule.name}: {rule.condition}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div className="space-y-2">
                                <h5 className="font-medium">Evaluation Summary</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Decision:</span>
                                    <span className="ml-2">{evaluationResult.decision}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Processing Time:</span>
                                    <span className="ml-2">{evaluationResult.processingTime}ms</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Rules Evaluated:</span>
                                    <span className="ml-2">{evaluationResult.rulesEvaluated}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Rules Triggered:</span>
                                    <span className="ml-2">{evaluationResult.rulesTriggered}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  PBAC Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Rule-Based</p>
                      <p className="text-sm text-gray-600">Condition-action rules</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Policy Sets</p>
                      <p className="text-sm text-gray-600">Grouped policy management</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Priority System</p>
                      <p className="text-sm text-gray-600">Ordered evaluation</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Dynamic Context</p>
                      <p className="text-sm text-gray-600">Runtime evaluation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Rule Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Condition Evaluation</h5>
                    <p className="text-blue-700">Supports complex boolean expressions</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-2">Effect Processing</h5>
                    <p className="text-green-700">Permit/Deny with priority</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h5 className="font-medium text-yellow-900 mb-2">Rule Ordering</h5>
                    <p className="text-yellow-700">First match wins</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h5 className="font-medium text-purple-900 mb-2">Context Variables</h5>
                    <p className="text-purple-700">User, resource, environment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}