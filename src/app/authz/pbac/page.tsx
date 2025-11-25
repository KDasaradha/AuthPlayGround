"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Shield,
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Play,
  Code,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Settings,
  BookOpen,
  GitBranch,
  Activity
} from "lucide-react"
import BackButton from "@/components/ui/back-button"

interface Policy {
  id: string
  name: string
  description: string
  type: "allow" | "deny"
  priority: number
  conditions: PolicyCondition[]
  actions: string[]
  resources: string[]
  effect: "allow" | "deny"
  enabled: boolean
  created_at: string
  updated_at: string
}

interface PolicyCondition {
  id: string
  type: "attribute" | "role" | "time" | "location" | "resource" | "custom"
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "in" | "not_in" | "matches"
  key: string
  value: string | string[] | number | boolean
  description?: string
}

interface PolicyEvaluation {
  id: string
  policy_id: string
  user_id: string
  resource: string
  action: string
  context: Record<string, any>
  result: "allow" | "deny"
  matched_policies: string[]
  evaluation_time: number
  timestamp: string
}

interface PolicyTemplate {
  id: string
  name: string
  description: string
  category: string
  template: Omit<Policy, "id" | "created_at" | "updated_at">
}

export default function PBACPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [policies, setPolicies] = useState<Policy[]>([])
  const [evaluations, setEvaluations] = useState<PolicyEvaluation[]>([])
  const [templates, setTemplates] = useState<PolicyTemplate[]>([])
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [showPolicyCode, setShowPolicyCode] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [newPolicy, setNewPolicy] = useState({
    name: "",
    description: "",
    type: "allow" as "allow" | "deny",
    priority: 100,
    conditions: [] as PolicyCondition[],
    actions: [] as string[],
    resources: [] as string[],
    enabled: true
  })

  const [testRequest, setTestRequest] = useState({
    user_id: "",
    resource: "",
    action: "",
    context: {}
  })

  const [newCondition, setNewCondition] = useState<PolicyCondition>({
    id: "",
    type: "attribute",
    operator: "equals",
    key: "",
    value: "",
    description: ""
  })

  useEffect(() => {
    loadPolicies()
    loadEvaluations()
    loadTemplates()
  }, [])

  const loadPolicies = async () => {
    try {
      const response = await fetch("/api/authz/pbac/policies")
      if (response.ok) {
        const data = await response.json()
        setPolicies(data.policies || [])
      }
    } catch (error) {
      console.error("Failed to load policies:", error)
    }
  }

  const loadEvaluations = async () => {
    try {
      const response = await fetch("/api/authz/pbac/evaluations")
      if (response.ok) {
        const data = await response.json()
        setEvaluations(data.evaluations || [])
      }
    } catch (error) {
      console.error("Failed to load evaluations:", error)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/authz/pbac/templates")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error("Failed to load templates:", error)
    }
  }

  const createPolicy = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/authz/pbac/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPolicy)
      })

      if (response.ok) {
        await loadPolicies()
        setIsCreateDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Failed to create policy:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testPolicy = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/authz/pbac/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testRequest)
      })

      if (response.ok) {
        const data = await response.json()
        setTestResult(data)
        await loadEvaluations()
      }
    } catch (error) {
      console.error("Failed to test policy:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deletePolicy = async (policyId: string) => {
    try {
      const response = await fetch(`/api/authz/pbac/policies/${policyId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await loadPolicies()
      }
    } catch (error) {
      console.error("Failed to delete policy:", error)
    }
  }

  const togglePolicy = async (policyId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/authz/pbac/policies/${policyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled })
      })

      if (response.ok) {
        await loadPolicies()
      }
    } catch (error) {
      console.error("Failed to toggle policy:", error)
    }
  }

  const addCondition = () => {
    const condition = {
      ...newCondition,
      id: Date.now().toString()
    }
    setNewPolicy(prev => ({
      ...prev,
      conditions: [...prev.conditions, condition]
    }))
    setNewCondition({
      id: "",
      type: "attribute",
      operator: "equals",
      key: "",
      value: "",
      description: ""
    })
  }

  const removeCondition = (conditionId: string) => {
    setNewPolicy(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== conditionId)
    }))
  }

  const resetForm = () => {
    setNewPolicy({
      name: "",
      description: "",
      type: "allow",
      priority: 100,
      conditions: [],
      actions: [],
      resources: [],
      enabled: true
    })
  }

  const applyTemplate = (template: PolicyTemplate) => {
    setNewPolicy(template.template)
    setIsCreateDialogOpen(true)
  }

  const generatePolicyCode = (policy: Policy) => {
    return `{
  "id": "${policy.id}",
  "name": "${policy.name}",
  "description": "${policy.description}",
  "effect": "${policy.effect}",
  "priority": ${policy.priority},
  "conditions": [
${policy.conditions.map(c => `    {
      "type": "${c.type}",
      "operator": "${c.operator}",
      "key": "${c.key}",
      "value": ${typeof c.value === "string" ? `"${c.value}"` : JSON.stringify(c.value)}
    }`).join(",\n")}
  ],
  "actions": ${JSON.stringify(policy.actions, null, 2)},
  "resources": ${JSON.stringify(policy.resources, null, 2)},
  "enabled": ${policy.enabled}
}`
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Policy-Based Access Control</h1>
              <p className="text-slate-600 mt-1">Advanced authorization with flexible policy rules</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="logs">Evaluation Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{policies.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {policies.filter(p => p.enabled).length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Allow Policies</CardTitle>
                  <Unlock className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {policies.filter(p => p.effect === "allow").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Granting access
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Deny Policies</CardTitle>
                  <Lock className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {policies.filter(p => p.effect === "deny").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Restricting access
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Evaluations</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{evaluations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Last 24 hours
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    PBAC Concepts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Policy Structure</h4>
                    <p className="text-sm text-blue-800">
                      Policies define access rules using conditions, actions, and resources with priority-based evaluation.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Condition Types</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Attribute-based (user properties)</li>
                      <li>• Role-based (user roles)</li>
                      <li>• Time-based (access schedules)</li>
                      <li>• Location-based (IP/geography)</li>
                      <li>• Resource-based (object properties)</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Evaluation Process</h4>
                    <p className="text-sm text-purple-800">
                      Policies are evaluated in priority order. First matching policy determines the access decision.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Policy Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">1</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Request Received</p>
                        <p className="text-xs text-muted-foreground">User requests access to resource</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Policy Matching</p>
                        <p className="text-xs text-muted-foreground">Find applicable policies</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Condition Evaluation</p>
                        <p className="text-xs text-muted-foreground">Check all conditions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">4</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Decision Made</p>
                        <p className="text-xs text-muted-foreground">Allow or deny access</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Access Policies</h2>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Policy
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Policy</DialogTitle>
                    <DialogDescription>
                      Define a new access policy with conditions and rules
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="policy-name">Policy Name</Label>
                        <Input
                          id="policy-name"
                          value={newPolicy.name}
                          onChange={(e) => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Admin Access Policy"
                        />
                      </div>
                      <div>
                        <Label htmlFor="policy-type">Effect</Label>
                        <Select value={newPolicy.type} onValueChange={(value: "allow" | "deny") => setNewPolicy(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="allow">Allow</SelectItem>
                            <SelectItem value="deny">Deny</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="policy-description">Description</Label>
                      <Textarea
                        id="policy-description"
                        value={newPolicy.description}
                        onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this policy does..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="policy-priority">Priority</Label>
                        <Input
                          id="policy-priority"
                          type="number"
                          value={newPolicy.priority}
                          onChange={(e) => setNewPolicy(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                          placeholder="100 (lower numbers = higher priority)"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="policy-enabled"
                          checked={newPolicy.enabled}
                          onCheckedChange={(checked) => setNewPolicy(prev => ({ ...prev, enabled: checked }))}
                        />
                        <Label htmlFor="policy-enabled">Enabled</Label>
                      </div>
                    </div>

                    <div>
                      <Label>Actions</Label>
                      <Input
                        placeholder="read, write, delete (comma-separated)"
                        onChange={(e) => setNewPolicy(prev => ({
                          ...prev,
                          actions: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                        }))}
                      />
                    </div>

                    <div>
                      <Label>Resources</Label>
                      <Input
                        placeholder="/api/users/*, /documents/* (comma-separated)"
                        onChange={(e) => setNewPolicy(prev => ({
                          ...prev,
                          resources: e.target.value.split(',').map(r => r.trim()).filter(r => r)
                        }))}
                      />
                    </div>

                    <div>
                      <Label>Conditions</Label>
                      <div className="space-y-4">
                        {newPolicy.conditions.map((condition, index) => (
                          <div key={condition.id} className="flex items-center gap-2 p-3 border rounded-lg">
                            <Badge variant="outline">{condition.type}</Badge>
                            <span className="text-sm">{condition.key} {condition.operator} {String(condition.value)}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCondition(condition.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        <div className="grid grid-cols-5 gap-2">
                          <Select value={newCondition.type} onValueChange={(value: any) => setNewCondition(prev => ({ ...prev, type: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="attribute">Attribute</SelectItem>
                              <SelectItem value="role">Role</SelectItem>
                              <SelectItem value="time">Time</SelectItem>
                              <SelectItem value="location">Location</SelectItem>
                              <SelectItem value="resource">Resource</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select value={newCondition.operator} onValueChange={(value: any) => setNewCondition(prev => ({ ...prev, operator: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="not_equals">Not Equals</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="not_contains">Not Contains</SelectItem>
                              <SelectItem value="greater_than">Greater Than</SelectItem>
                              <SelectItem value="less_than">Less Than</SelectItem>
                              <SelectItem value="in">In</SelectItem>
                              <SelectItem value="not_in">Not In</SelectItem>
                              <SelectItem value="matches">Matches</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            placeholder="Key"
                            value={newCondition.key}
                            onChange={(e) => setNewCondition(prev => ({ ...prev, key: e.target.value }))}
                          />

                          <Input
                            placeholder="Value"
                            value={String(newCondition.value)}
                            onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
                          />

                          <Button onClick={addCondition}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createPolicy} disabled={isLoading}>
                        Create Policy
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {policies.map((policy) => (
                <Card key={policy.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {policy.effect === "allow" ? (
                            <Unlock className="h-5 w-5 text-green-600" />
                          ) : (
                            <Lock className="h-5 w-5 text-red-600" />
                          )}
                          {policy.name}
                        </CardTitle>
                        <CardDescription>{policy.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={policy.enabled ? "default" : "secondary"}>
                          {policy.enabled ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          Priority: {policy.priority}
                        </Badge>
                        <Switch
                          checked={policy.enabled}
                          onCheckedChange={(checked) => togglePolicy(policy.id, checked)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedPolicy(policy)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deletePolicy(policy.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-medium">Actions:</span>
                        {policy.actions.map((action) => (
                          <Badge key={action} variant="outline">{action}</Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-medium">Resources:</span>
                        {policy.resources.map((resource) => (
                          <Badge key={resource} variant="outline">{resource}</Badge>
                        ))}
                      </div>
                      <div>
                        <span className="text-sm font-medium">Conditions:</span>
                        <div className="mt-2 space-y-1">
                          {policy.conditions.map((condition) => (
                            <div key={condition.id} className="text-sm p-2 bg-slate-50 rounded">
                              <Badge variant="outline" className="mr-2">{condition.type}</Badge>
                              {condition.key} {condition.operator} {String(condition.value)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                    <Badge variant="outline">{template.category}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Effect:</span> {template.template.effect}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Conditions:</span> {template.template.conditions.length}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Actions:</span> {template.template.actions.join(", ")}
                      </div>
                      <Button
                        className="w-full mt-4"
                        onClick={() => applyTemplate(template)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Policy Testing
                </CardTitle>
                <CardDescription>
                  Test your policies against different scenarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="test-user">User ID</Label>
                    <Input
                      id="test-user"
                      value={testRequest.user_id}
                      onChange={(e) => setTestRequest(prev => ({ ...prev, user_id: e.target.value }))}
                      placeholder="user_123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="test-resource">Resource</Label>
                    <Input
                      id="test-resource"
                      value={testRequest.resource}
                      onChange={(e) => setTestRequest(prev => ({ ...prev, resource: e.target.value }))}
                      placeholder="/api/users"
                    />
                  </div>
                  <div>
                    <Label htmlFor="test-action">Action</Label>
                    <Input
                      id="test-action"
                      value={testRequest.action}
                      onChange={(e) => setTestRequest(prev => ({ ...prev, action: e.target.value }))}
                      placeholder="read"
                    />
                  </div>
                  <div>
                    <Label htmlFor="test-context">Context (JSON)</Label>
                    <Textarea
                      id="test-context"
                      value={JSON.stringify(testRequest.context, null, 2)}
                      onChange={(e) => {
                        try {
                          const context = JSON.parse(e.target.value)
                          setTestRequest(prev => ({ ...prev, context }))
                        } catch (error) {
                          // Invalid JSON, ignore
                        }
                      }}
                      placeholder='{"role": "admin", "department": "IT"}'
                    />
                  </div>
                </div>

                <Button onClick={testPolicy} disabled={isLoading} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Test Policy
                </Button>

                {testResult && (
                  <div className="space-y-4">
                    <Alert className={testResult.result === "allow" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Result:</span>
                          <Badge variant={testResult.result === "allow" ? "default" : "destructive"}>
                            {testResult.result.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium">Matched Policies:</span>
                          <ul className="mt-1 space-y-1">
                            {testResult.matched_policies.map((policyId: string) => (
                              <li key={policyId} className="text-sm">• {policyId}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium">Evaluation Time:</span> {testResult.evaluation_time}ms
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Evaluation Logs
                </CardTitle>
                <CardDescription>
                  Recent policy evaluations and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Matched Policies</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell className="text-sm">
                          {new Date(evaluation.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">{evaluation.user_id}</TableCell>
                        <TableCell className="text-sm">{evaluation.resource}</TableCell>
                        <TableCell className="text-sm">{evaluation.action}</TableCell>
                        <TableCell>
                          <Badge variant={evaluation.result === "allow" ? "default" : "destructive"}>
                            {evaluation.result}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {evaluation.matched_policies.length > 0 ? (
                            <div className="space-y-1">
                              {evaluation.matched_policies.map((policyId) => (
                                <div key={policyId} className="text-xs">{policyId}</div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{evaluation.evaluation_time}ms</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Policy Detail Dialog */}
        <Dialog open={!!selectedPolicy} onOpenChange={() => setSelectedPolicy(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                {selectedPolicy?.name}
              </DialogTitle>
              <DialogDescription>
                Policy configuration and code representation
              </DialogDescription>
            </DialogHeader>
            {selectedPolicy && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPolicyCode(!showPolicyCode)}
                  >
                    {showPolicyCode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showPolicyCode ? "Hide Code" : "Show Code"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generatePolicyCode(selectedPolicy))
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>

                {showPolicyCode ? (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{generatePolicyCode(selectedPolicy)}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Effect</Label>
                        <Badge variant={selectedPolicy.effect === "allow" ? "default" : "destructive"}>
                          {selectedPolicy.effect}
                        </Badge>
                      </div>
                      <div>
                        <Label>Priority</Label>
                        <Badge variant="outline">{selectedPolicy.priority}</Badge>
                      </div>
                      <div>
                        <Label>Enabled</Label>
                        <Badge variant={selectedPolicy.enabled ? "default" : "secondary"}>
                          {selectedPolicy.enabled ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div>
                        <Label>Created</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedPolicy.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label>Actions</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedPolicy.actions.map((action) => (
                          <Badge key={action} variant="outline">{action}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Resources</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedPolicy.resources.map((resource) => (
                          <Badge key={resource} variant="outline">{resource}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Conditions</Label>
                      <div className="space-y-2 mt-2">
                        {selectedPolicy.conditions.map((condition) => (
                          <div key={condition.id} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{condition.type}</Badge>
                              <span className="text-sm font-medium">{condition.operator}</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Key:</span> {condition.key}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Value:</span> {String(condition.value)}
                            </div>
                            {condition.description && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {condition.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}