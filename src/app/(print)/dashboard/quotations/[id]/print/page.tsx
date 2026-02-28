import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import PrintTrigger from './PrintTrigger'

function fmt(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 0 })
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QuotationPrintPage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  let quotation: any
  try {
    quotation = await payload.findByID({
      collection: 'quotations',
      id,
      depth: 1,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }
  if (!quotation) notFound()

  const lead = typeof quotation.lead === 'object' && quotation.lead !== null ? quotation.lead : null

  const categories: Array<{
    categoryName: string
    items: Array<{
      particulars: string
      amount: number
      quantity: number
      total?: number
      remarks?: string
    }>
  }> = quotation.categories || []

  const subTotal: number = quotation.subTotal || 0
  const agencyFees: number = quotation.agencyFees || 0
  const grandTotal: number = quotation.grandTotal || 0
  const agencyFeePercent: number = quotation.agencyFeePercent || 12

  const quotationDate = quotation.quotationDate
    ? new Date(quotation.quotationDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null

  const statusColors: Record<string, { bg: string; color: string }> = {
    draft: { bg: '#f3f4f6', color: '#4b5563' },
    sent: { bg: '#dbeafe', color: '#1d4ed8' },
    approved: { bg: '#dcfce7', color: '#15803d' },
    rejected: { bg: '#fee2e2', color: '#b91c1c' },
  }
  const statusColor = statusColors[quotation.status] || statusColors.draft

  let rowCounter = 0

  return (
    <>
      <PrintTrigger />

      {/* Global print styles injected inline via dangerouslySetInnerHTML on a style tag */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: A4; margin: 14mm 14mm 14mm 14mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
            * { box-sizing: border-box; }
            body { margin: 0; padding: 0; background: #fff; }
            a { text-decoration: none; color: inherit; }
          `,
        }}
      />

      {/* Top action bar */}
      <div
        className="no-print"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          background: '#1e3a5f',
          color: '#fff',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: 14,
        }}
      >
        <span style={{ fontWeight: 500 }}>Quotation Preview — {quotation.title}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={`/dashboard/quotations/${id}`}
            style={{
              background: 'transparent',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.4)',
              padding: '6px 16px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            ← Back
          </a>
          <button
            id="print-btn"
            style={{
              background: '#fff',
              color: '#1e3a5f',
              border: 'none',
              padding: '6px 18px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🖨️ Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Page content */}
      <div
        style={{
          marginTop: 52,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: 13,
          color: '#111827',
          background: '#fff',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 40px' }}>
          {/* ── Header ── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 28,
              paddingBottom: 20,
              borderBottom: '2px solid #1e3a5f',
            }}
          >
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f', letterSpacing: -0.5 }}>
                Perfect Knot
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#6b7280',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}
              >
                Wedding &amp; Event Management
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>
                Quotation
              </div>
              {quotationDate && (
                <div style={{ fontSize: 11, color: '#6b7280' }}>Date: {quotationDate}</div>
              )}
              {quotation.status && (
                <div style={{ marginTop: 6 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      background: statusColor.bg,
                      color: statusColor.color,
                    }}
                  >
                    {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Quotation title ── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{quotation.title}</div>
          </div>

          {/* ── Client info bar ── */}
          {lead && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 28,
                padding: '16px 20px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: '#9ca3af',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  Prepared For
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                  {lead.fullName}
                </div>
                {lead.email && (
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{lead.email}</div>
                )}
                {lead.phone && (
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{lead.phone}</div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 10,
                    color: '#9ca3af',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  Grand Total
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#1e3a5f' }}>
                  ₹{fmt(grandTotal)}
                </div>
              </div>
            </div>
          )}

          {/* ── Quotation table ── */}
          {categories.length > 0 && (
            <>
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px 8px 0 0',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {[
                        { label: 'Sr. No.', width: 52, align: 'center' as const },
                        { label: 'Particulars', width: undefined, align: 'left' as const },
                        { label: 'Amount (₹)', width: 120, align: 'right' as const },
                        { label: 'Qty', width: 60, align: 'right' as const },
                        { label: 'Total (₹)', width: 130, align: 'right' as const },
                        { label: 'Remarks', width: 150, align: 'left' as const },
                      ].map((col) => (
                        <th
                          key={col.label}
                          style={{
                            background: '#1e3a5f',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            padding: '10px 12px',
                            textAlign: col.align,
                            width: col.width,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat, ci) => (
                      <React.Fragment key={ci}>
                        {/* Category header */}
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              background: '#f1f5f9',
                              fontWeight: 700,
                              fontSize: 12,
                              color: '#1e3a5f',
                              padding: '8px 12px',
                              borderTop: '1px solid #e2e8f0',
                              borderBottom: '1px solid #e2e8f0',
                            }}
                          >
                            {cat.categoryName}
                          </td>
                        </tr>
                        {/* Line items */}
                        {cat.items.map((item, ii) => {
                          rowCounter += 1
                          const itemTotal = (item.amount || 0) * (item.quantity || 1)
                          const isEven = rowCounter % 2 === 0
                          return (
                            <tr key={ii}>
                              <td
                                style={{
                                  padding: '9px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  fontSize: 11,
                                  color: '#9ca3af',
                                  textAlign: 'center',
                                  background: isEven ? '#fafafa' : '#fff',
                                  fontFamily: 'monospace',
                                }}
                              >
                                {rowCounter}
                              </td>
                              <td
                                style={{
                                  padding: '9px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  fontSize: 12,
                                  color: '#374151',
                                  background: isEven ? '#fafafa' : '#fff',
                                }}
                              >
                                {item.particulars}
                              </td>
                              <td
                                style={{
                                  padding: '9px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  fontSize: 12,
                                  color: '#374151',
                                  textAlign: 'right',
                                  background: isEven ? '#fafafa' : '#fff',
                                }}
                              >
                                {item.amount ? fmt(item.amount) : '—'}
                              </td>
                              <td
                                style={{
                                  padding: '9px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  fontSize: 12,
                                  color: '#374151',
                                  textAlign: 'right',
                                  background: isEven ? '#fafafa' : '#fff',
                                }}
                              >
                                {item.quantity ?? 1}
                              </td>
                              <td
                                style={{
                                  padding: '9px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  fontSize: 12,
                                  color: '#111827',
                                  textAlign: 'right',
                                  fontWeight: 600,
                                  background: isEven ? '#fafafa' : '#fff',
                                }}
                              >
                                {fmt(itemTotal)}
                              </td>
                              <td
                                style={{
                                  padding: '9px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  fontSize: 11,
                                  color: '#9ca3af',
                                  background: isEven ? '#fafafa' : '#fff',
                                }}
                              >
                                {item.remarks || '—'}
                              </td>
                            </tr>
                          )
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  border: '1px solid #e2e8f0',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  overflow: 'hidden',
                  marginBottom: 24,
                }}
              >
                <table style={{ width: 320, borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          padding: '9px 16px',
                          fontSize: 13,
                          color: '#6b7280',
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        Sub-Total
                      </td>
                      <td
                        style={{
                          padding: '9px 16px',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#111827',
                          textAlign: 'right',
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        ₹{fmt(subTotal)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: '9px 16px',
                          fontSize: 13,
                          color: '#6b7280',
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        Agency Fees ({agencyFeePercent}%)
                      </td>
                      <td
                        style={{
                          padding: '9px 16px',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#111827',
                          textAlign: 'right',
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        ₹{fmt(agencyFees)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: '10px 16px',
                          fontSize: 14,
                          fontWeight: 700,
                          background: '#1e3a5f',
                          color: '#fff',
                        }}
                      >
                        Grand Total
                      </td>
                      <td
                        style={{
                          padding: '10px 16px',
                          fontSize: 14,
                          fontWeight: 700,
                          background: '#1e3a5f',
                          color: '#fff',
                          textAlign: 'right',
                        }}
                      >
                        ₹{fmt(grandTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {categories.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 0',
                color: '#9ca3af',
                fontSize: 14,
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                marginBottom: 24,
              }}
            >
              No line items in this quotation.
            </div>
          )}

          {/* ── Notes ── */}
          {quotation.notes && (
            <div
              style={{
                marginTop: 8,
                marginBottom: 24,
                padding: '14px 18px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#92400e',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                Notes
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#78350f',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                {quotation.notes}
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div
            style={{
              marginTop: 40,
              paddingTop: 16,
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.6 }}>
              <strong>Perfect Knot</strong> – Wedding &amp; Event Management
              <br />
              This quotation is computer generated and valid for 30 days from the date of issue.
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>
              Generated on{' '}
              {new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
