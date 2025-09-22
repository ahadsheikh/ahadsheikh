# Multi-Column Index Storage in B+ Trees

## Overview
Multi-column indexes (also called composite indexes) in B+ trees store multiple column values as a single composite key. The key is formed by concatenating the values of all indexed columns in the order they were defined.

## Key Composition
For an index on columns (A, B, C), the composite key is formed as:
```
Composite Key = A || B || C
```

## Visual Representation

### Example Table
```
Table: employees
+----+----------+--------+--------+
| id | lastname | dept   | salary |
+----+----------+--------+--------+
| 1  | Smith    | IT     | 70000  |
| 2  | Johnson  | HR     | 65000  |
| 3  | Brown    | IT     | 75000  |
| 4  | Davis    | Sales  | 60000  |
| 5  | Wilson   | IT     | 80000  |
| 6  | Anderson | HR     | 68000  |
+----+----------+--------+--------+
```

### Multi-Column Index on (dept, salary)

#### B+ Tree Structure
```
                    Root Node
                   ┌─────────────┐
                   │   [IT,70000] │
                   └─────┬───────┘
                         │
            ┌────────────┴────────────┐
            │                         │
      ┌─────────────┐           ┌─────────────┐
      │ [HR,65000]  │           │ [IT,75000]  │
      └─────┬───────┘           └─────┬───────┘
            │                         │
    ┌───────┴────┐               ┌────┴──────┐
    │            │               │           │
┌───────┐    ┌───────┐      ┌────────┐  ┌────────┐
│Leaf 1 │    │Leaf 2 │      │Leaf 3  │  │Leaf 4  │
└───────┘    └───────┘      └────────┘  └────────┘
```

#### Leaf Nodes Content
```
Leaf 1:
┌─────────────────────────────────┐
│ [HR,65000] → Row Pointer(2)     │
│ [HR,68000] → Row Pointer(6)     │
└─────────────────────────────────┘
        ↓ (next pointer)

Leaf 2:
┌─────────────────────────────────┐
│ [IT,70000] → Row Pointer(1)     │
│ [IT,75000] → Row Pointer(3)     │
└─────────────────────────────────┘
        ↓ (next pointer)

Leaf 3:
┌─────────────────────────────────┐
│ [IT,80000] → Row Pointer(5)     │
│ [Sales,60000] → Row Pointer(4)  │
└─────────────────────────────────┘
        ↓ (next pointer = NULL)
```

## Key Ordering
The composite keys are ordered lexicographically:
1. First by the first column (dept)
2. Then by the second column (salary) within the same first column value
3. And so on for additional columns

### Sorted Order Example:
```
1. [HR,65000]
2. [HR,68000]
3. [IT,70000]
4. [IT,75000]
5. [IT,80000]
6. [Sales,60000]
```

## Search Scenarios

### 1. Full Key Search (dept='IT' AND salary=75000)
```
Search Path: Root → [IT,75000] found in Leaf 2
Result: Direct match, O(log n) complexity
```

### 2. Prefix Search (dept='IT')
```
Search Path: Root → Find first occurrence of 'IT'
Result: Range scan from [IT,70000] to [IT,80000]
Can use index efficiently
```

### 3. Non-Prefix Search (salary=75000)
```
Search: Cannot use index efficiently
Reason: Salary is not the leading column
Result: Full table scan required
```

## Index Efficiency Rules

### ✅ Efficient Queries
- `WHERE dept = 'IT'`
- `WHERE dept = 'IT' AND salary = 75000`
- `WHERE dept = 'IT' AND salary > 70000`
- `ORDER BY dept, salary`

### ❌ Inefficient Queries
- `WHERE salary = 75000` (skips first column)
- `WHERE dept = 'IT' AND salary = 75000 AND lastname = 'Brown'` (gap in column order)

## Memory Layout

### Node Structure
```
┌─────────────────────────────────────────────┐
│ Node Header                                 │
├─────────────────────────────────────────────┤
│ Key 1: [dept_value][salary_value]           │
│ Pointer 1: → Child Node or Row Pointer     │
├─────────────────────────────────────────────┤
│ Key 2: [dept_value][salary_value]           │
│ Pointer 2: → Child Node or Row Pointer     │
├─────────────────────────────────────────────┤
│ ...                                         │
└─────────────────────────────────────────────┘
```

### Key Comparison Function
```
compare(key1, key2):
    if key1.dept != key2.dept:
        return compare(key1.dept, key2.dept)
    else:
        return compare(key1.salary, key2.salary)
```

## Advantages of Multi-Column B+ Trees
1. **Efficient Range Queries**: On prefix columns
2. **Sorted Access**: Natural ordering by composite key
3. **Space Efficiency**: Single index for multiple query patterns
4. **Reduced I/O**: Clustered related data

## Considerations
1. **Column Order Matters**: Most selective column should be first
2. **Index Size**: Grows with number of columns
3. **Maintenance Cost**: Updates affect composite key ordering
4. **Query Patterns**: Must match index column prefix for efficiency