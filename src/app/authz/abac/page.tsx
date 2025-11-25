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
  Settings,
  Check,
  X,
  Users,
  User,
  Shield,
  Target,
  UserCheck,
  Info,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Plus,
  Filter,
  Code,
  Database,
  Clock,
  Map,
  Zap,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Attribute {
  id?: string
  name: string
  value: string
  type: string
  category: string
}

interface Policy {
  id: string
  name: string
  description: string
  conditions: PolicyCondition[]
  effect: string
  priority: number
}

interface PolicyCondition {
  attribute: string
  operator: string
  value: string
}

interface AccessRequest {
  userId: string
  resource: string
  action: string
  context: Record<string, any>
}

export default function ABACPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [newAttributeName, setNewAttributeName] = useState("")
  const [newAttributeValue, setNewAttributeValue] = useState("")
  const [newAttributeType, setNewAttributeType] = useState("string")
  const [newAttributeCategory, setNewAttributeCategory] = useState("user")
  const [newPolicyName, setNewPolicyName] = useState("")
  const [newPolicyDescription, setNewPolicyDescription] = useState("")
  const [newPolicyEffect, setNewPolicyEffect] = useState("permit")
  const [newPolicyPriority, setNewPolicyPriority] = useState(1)
  const [policyConditions, setPolicyConditions] = useState<PolicyCondition[]>([])
  const [accessRequest, setAccessRequest] = useState<AccessRequest>({
    userId: "",
    resource: "",
    action: "",
    context: {}
  })
  const [evaluationResult, setEvaluationResult] = useState<any>(null)
  const { toast } = useToast()

  // Initialize with default data
  useEffect(() => {
    const defaultAttributes: Attribute[] = [
      { name: "department", value: "engineering", type: "string", category: "user" },
      { name: "role", value: "developer", type: "string", category: "user" },
      { name: "clearance", value: "secret", type: "string", category: "user" },
      { name: "location", value: "US", type: "string", category: "user" },
      { name: "project", value: "alpha", type: "string", category: "resource" },
      { name: "sensitivity", value: "high", type: "string", category: "resource" },
      { name: "time", value: "09:00-17:00", type: "string", category: "environment" },
      { name: "day_of_week", value: "monday-friday", type: "string", category: "environment" },
      { name: "device_trusted", value: "true", type: "boolean", category: "environment" }
    ]

    const defaultPolicies: Policy[] = [
      {
        id: "policy_1",
        name: "High Security Access",
        description: "Allow access to high-security resources for authorized personnel",
        conditions: [
          { attribute: "user.clearance", operator: "equals", value: "secret" },
          { attribute: "resource.sensitivity", operator: "equals", value: "high" }
        ],
        effect: "permit",
        priority: 1
      },
      {
        id: "policy_2",
        name: "Engineering Project Access",
        description: "Allow engineering access to engineering projects",
        conditions: [
          { attribute: "user.department", operator: "equals", value: "engineering" },
          { attribute: "resource.project", operator: "equals", value: "alpha" }
        ],
        effect: "permit",
        priority: 2
      },
      {
        id: "policy_3",
        name: "Business Hours Access",
        description: "Allow access only during business hours",
        conditions: [
          { attribute: "environment.time", operator: "in_range", value: "09:00-17:00" },
          { attribute: "environment.day_of_week", operator: "in", value: "monday-friday" }
        ],
        effect: "permit",
        priority: 3
      },
      {
        id: "policy_4",
        name: "Trusted Device Only",
        description: "Allow access only from trusted devices",
        conditions: [
          { attribute: "environment.device_trusted", operator: "equals", value: "true" }
        ],
        effect: "permit",
        priority: 4
      },
      {
        id: "policy_5",
        name: "Deny Unknown Locations",
        description: "Deny access from unknown locations",
        conditions: [
          { attribute: "user.location", operator: "not_equals", value: "US" }
        ],
        effect: "deny",
        priority: 5
      }
    ]

    setAttributes(defaultAttributes)
    setPolicies(defaultPolicies)
  }, [])

  const handleCreateAttribute = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/authz/abac/attribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAttributeName,
          value: newAttributeValue,
          type: newAttributeType,
          category: newAttributeCategory
        })
      })

      const data = await response.json()

      if (data.success) {
        const newAttribute: Attribute = {
          id: data.attribute.id,
          name: newAttributeName,
          value: newAttributeValue,
          type: newAttributeType,
          category: newAttributeCategory
        }
        setAttributes([...attributes, newAttribute])
        setNewAttributeName("")
        setNewAttributeValue("")
        setNewAttributeType("string")
        setNewAttributeCategory("user")
        toast({
          title: "Attribute Created",
          description: "New attribute has been created successfully"
        })
      } else {
        toast({
          title: "Creation Failed",
          description: data.error || "Failed to create attribute",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create attribute",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreatePolicy = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/authz/abac/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPolicyName,
          description: newPolicyDescription,
          conditions: policyConditions,
          effect: newPolicyEffect,
          priority: newPolicyPriority
        })
      })

      const data = await response.json()

      if (data.success) {
        const newPolicy: Policy = {
          id: data.policy.id,
          name: newPolicyName,
          description: newPolicyDescription,
          conditions: policyConditions,
          effect: newPolicyEffect,
          priority: newPolicyPriority
        }
        setPolicies([...policies, newPolicy])
        setNewPolicyName("")
        setNewPolicyDescription("")
        setPolicyConditions([])
        setNewPolicyEffect("permit")
        setNewPolicyPriority(1)
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

  const handleEvaluateAccess = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/authz/abac/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accessRequest)
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
          description: data.error || "Failed to evaluate access",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate access",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const addPolicyCondition = () => {
    const newCondition: PolicyCondition = {
      attribute: "",
      operator: "equals",
      value: ""
    }
    setPolicyConditions([...policyConditions, newCondition])
  }

  const updatePolicyCondition = (index: number, field: keyof PolicyCondition, value: string) => {
    const updatedConditions = [...policyConditions]
    updatedConditions[index] = { ...updatedConditions[index], [field]: value }
    setPolicyConditions(updatedConditions)
  }

  const removePolicyCondition = (index: number) => {
    setPolicyConditions(policyConditions.filter((_, i) => i !== index))
  }

  const getAttributesByCategory = () => {
    const categories: { [key: string]: Attribute[] } = {}
    attributes.forEach(attr => {
      if (!categories[attr.category]) {
        categories[attr.category] = []
      }
      categories[attr.category].push(attr)
    })
    return categories
  }

  const attributesByCategory = getAttributesByCategory()

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Settings className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">ABAC</h1>
          </div>
          <p className="text-xl text-gray-600">Attribute-Based Access Control</p>
          <p className="text-lg text-gray-500 mt-2">Dynamic access control based on attributes and policies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main ABAC Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  ABAC Management
                </CardTitle>
                <CardDescription>
                  Define attributes, create policies, and evaluate access requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="attributes" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="attributes">Attributes</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                    <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                  </TabsList>

                  <TabsContent value="attributes" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Attribute Management</h3>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Attribute
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Attribute Name</Label>
                          <Input
                            value={newAttributeName}
                            onChange={(e) => setNewAttributeName(e.target.value)}
                            placeholder="e.g., department"
                          />
                        </div>
                        <div>
                          <Label>Attribute Value</Label>
                          <Input
                            value={newAttributeValue}
                            onChange={(e) => setNewAttributeValue(e.target.value)}
                            placeholder="e.g., engineering"
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <select
                            value={newAttributeType}
                            onChange={(e) => setNewAttributeType(e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="date">Date</option>
                          </select>
                        </div>
                        <div>
                          <Label>Category</Label>
                          <select
                            value={newAttributeCategory}
                            onChange={(e) => setNewAttributeCategory(e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="user">User</option>
                            <option value="resource">Resource</option>
                            <option value="environment">Environment</option>
                            <option value="action">Action</option>
                          </select>
                        </div>
                      </div>

                      <Button
                        onClick={handleCreateAttribute}
                        disabled={isProcessing || !newAttributeName || !newAttributeValue}
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
                            Create Attribute
                          </>
                        )}
                      </Button>

                      <div className="space-y-4">
                        {Object.entries(attributesByCategory).map(([category, categoryAttributes]) => (
                          <div key={category} className="space-y-2">
                            <h4 className="font-medium text-gray-700 capitalize">{category} Attributes</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {categoryAttributes.map((attr) => (
                                <Card key={attr.name} className="hover:shadow-md transition-shadow">
                                  <CardContent className="pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-semibold">{attr.name}</h5>
                                      <Badge variant="outline">{attr.type}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{attr.value}</p>
                                    <Badge variant="secondary" className="text-xs">
                                      {attr.category}
                                    </Badge>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="policies" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Policy Management</h3>
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label>Effect</Label>
                            <select
                              value={newPolicyEffect}
                              onChange={(e) => setNewPolicyEffect(e.target.value)}
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="permit">Permit</option>
                              <option value="deny">Deny</option>
                            </select>
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <Input
                              type="number"
                              value={newPolicyPriority}
                              onChange={(e) => setNewPolicyPriority(parseInt(e.target.value))}
                              placeholder="1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Conditions</Label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={addPolicyCondition}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {policyConditions.map((condition, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder="Attribute"
                                value={condition.attribute}
                                onChange={(e) => updatePolicyCondition(index, 'attribute', e.target.value)}
                              />
                              <select
                                value={condition.operator}
                                onChange={(e) => updatePolicyCondition(index, 'operator', e.target.value)}
                                className="p-2 border rounded-md"
                              >
                                <option value="equals">Equals</option>
                                <option value="not_equals">Not Equals</option>
                                <option value="in">In</option>
                                <option value="not_in">Not In</option>
                                <option value="greater_than">Greater Than</option>
                                <option value="less_than">Less Than</option>
                                <option value="in_range">In Range</option>
                              </select>
                              <Input
                                placeholder="Value"
                                value={condition.value}
                                onChange={(e) => updatePolicyCondition(index, 'value', e.target.value)}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removePolicyCondition(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={handleCreatePolicy}
                        disabled={isProcessing || !newPolicyName || policyConditions.length === 0}
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
                                    <Badge variant={policy.effect === "permit" ? "default" : "destructive"}>
                                      {policy.effect}
                                    </Badge>
                                    <Badge variant="outline">Priority: {policy.priority}</Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
                                <div className="space-y-1">
                                  {policy.conditions.map((condition, index) => (
                                    <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                                      {condition.attribute} {condition.operator} "{condition.value}"
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

                  <TabsContent value="evaluate" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Access Request Evaluation</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>User ID</Label>
                          <Input
                            value={accessRequest.userId}
                            onChange={(e) => setAccessRequest({ ...accessRequest, userId: e.target.value })}
                            placeholder="Enter user ID"
                          />
                        </div>
                        <div>
                          <Label>Resource</Label>
                          <Input
                            value={accessRequest.resource}
                            onChange={(e) => setAccessRequest({ ...accessRequest, resource: e.target.value })}
                            placeholder="Enter resource"
                          />
                        </div>
                        <div>
                          <Label>Action</Label>
                          <Input
                            value={accessRequest.action}
                            onChange={(e) => setAccessRequest({ ...accessRequest, action: e.target.value })}
                            placeholder="Enter action"
                          />
                        </div>
                        <div>
                          <Label>Context (JSON)</Label>
                          <textarea
                            value={JSON.stringify(accessRequest.context, null, 2)}
                            onChange={(e) => setAccessRequest({ ...accessRequest, context: JSON.parse(e.target.value) })}
                            placeholder='{"time": "09:00", "location": "US"}'
                            className="w-full h-20 p-3 border rounded-md font-mono text-sm"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleEvaluateAccess}
                        disabled={isProcessing || !accessRequest.userId || !accessRequest.resource || !accessRequest.action}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Evaluating...
                          </>
                        ) : (
                          <>
                            <Target className="mr-2 h-4 w-4" />
                            Evaluate Access
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="results" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Evaluation Results</h3>

                      {evaluationResult ? (
                        <div className="space-y-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold">Access Decision</h4>
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
                                        {policy.name} (Priority: {policy.priority})
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <Label>Matched Conditions</Label>
                                  <div className="space-y-1 mt-2">
                                    {evaluationResult.matchedConditions?.map((condition: any, index: number) => (
                                      <div key={index} className="text-sm bg-green-50 p-2 rounded">
                                        ✓ {condition.attribute} {condition.operator} "{condition.value}"
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
                                    <span className="font-medium">Total Policies:</span>
                                    <span className="ml-2">{evaluationResult.totalPolicies}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Matched Policies:</span>
                                    <span className="ml-2">{evaluationResult.matchedPolicies}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Final Decision:</span>
                                    <span className="ml-2">{evaluationResult.decision}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Evaluation Time:</span>
                                    <span className="ml-2">{evaluationResult.evaluationTime}ms</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            No evaluation results yet. Create an access request and evaluate it.
                          </AlertDescription>
                        </Alert>
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
                  ABAC Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Dynamic Access</p>
                      <p className="text-sm text-gray-600">Context-aware decisions</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Fine-Grained</p>
                      <p className="text-sm text-gray-600">Attribute-level control</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Scalable</p>
                      <p className="text-sm text-gray-600">Policy-based rules</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Adaptive</p>
                      <p className="text-sm text-gray-600">Real-time evaluation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Attribute Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">User Attributes</h5>
                    <p className="text-sm text-blue-700">Properties about the user making the request</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-2">Resource Attributes</h5>
                    <p className="text-sm text-green-700">Properties about the resource being accessed</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h5 className="font-medium text-yellow-900 mb-2">Environment Attributes</h5>
                    <p className="text-sm text-yellow-700">Context about the access request</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h5 className="font-medium text-purple-900 mb-2">Action Attributes</h5>
                    <p className="text-sm text-purple-700">Properties about the action being performed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Policy Operators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">equals:</span>
                    <span className="font-mono">attribute == value</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">not_equals:</span>
                    <span className="font-mono">attribute != value</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">in:</span>
                    <span className="font-mono">attribute in [value1, value2]</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">greater_than:</span>
                    <span className="font-mono">attribute {'>'} value</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">in_range:</span>
                    <span className="font-mono">value1 {'<='} attribute {'<='} value2</span>
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